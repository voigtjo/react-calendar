import React, { useState, useEffect } from 'react';
import CalendarApp from './CalendarApp';
import ICAL from 'ical.js';
import { Button } from '@mui/material';
import ical from 'ical-generator';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function App() {
  const [events, setEvents] = useState([]);

  const [selectedDates, setSelectedDates] = useState(new Set()); // Ensure this state is defined

  useEffect(() => {
    // Assuming findOverlaps function is correctly defined somewhere in this file
    setOverlaps(findOverlaps(events));
  }, [events]);

  const handleFileChange = async (event) => {
    const files = event.target.files;
    const fileColors = ['#f56b6b', '#6bbcf5', '#bcf56b', '#f5d76b']; // Example colors for different files
    const promises = Array.from(files).map((file, index) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = ICAL.parse(e.target.result);
                    const comp = new ICAL.Component(data);
                    const vevents = comp.getAllSubcomponents('vevent');
                    const parsedEvents = vevents.map((vevent) => {
                        const event = new ICAL.Event(vevent);
                        return {
                            title: event.summary,
                            start: event.startDate.toJSDate(),
                            end: event.endDate.toJSDate(),
                            allDay: event.startDate.isDate,
                            color: fileColors[index % fileColors.length] // Assign color cyclically based on file index
                        };
                    });
                    resolve(parsedEvents);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(reader.error);
            };
            reader.readAsText(file);
        });
    });

    Promise.all(promises)
        .then(results => {
            // Flatten the array of event arrays to a single array and merge with existing events
            const allEvents = results.flat();
            setEvents(prevEvents => [...prevEvents, ...allEvents]);
        })
        .catch(error => {
            console.error('Error reading files:', error);
        });
};

const [overlaps, setOverlaps] = useState([]);

function findOverlaps(events) {
  let overlaps = [];
  events.forEach((eventA, indexA) => {
      events.forEach((eventB, indexB) => {
          if (indexA !== indexB && eventA.end > eventB.start && eventA.start < eventB.end) {
              overlaps.push({
                  start: new Date(Math.max(eventA.start, eventB.start)),
                  end: new Date(Math.min(eventA.end, eventB.end)),
                  titles: [eventA.title, eventB.title]
              });
          }
      });
  });
  return overlaps;
};

const exportCalendar = () => {
  const cal = ical({ domain: 'example.com', name: 'My Calendar' });
  selectedDates.forEach(date => {
      cal.createEvent({
          start: new Date(date),
          end: new Date(date),
          summary: 'Selected Date',
          allDay: true
      });
  });
  const icalData = cal.toString();
  const blob = new Blob([icalData], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'calendar.ics');
  document.body.appendChild(link);
  link.click();
};

const formatDate = (date) => {
  return date.toLocaleDateString('de-DE', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
  });
};

return (
  <div className="App">
      <input type="file" onChange={handleFileChange} accept=".ics" multiple />
        <CalendarApp events={events} selectedDates={selectedDates} setSelectedDates={setSelectedDates} />
        <Button onClick={exportCalendar} variant="contained" color="primary" style={{ margin: '20px' }}>
            Export Calendar
        </Button>
      <div style={{ marginTop: '20px' }}>
          <TableContainer component={Paper}>
              <Table>
                  <TableHead>
                      <TableRow>
                          <TableCell style={{ fontWeight: 'bold' }}>Start</TableCell>
                          <TableCell style={{ fontWeight: 'bold' }}>End</TableCell>
                          <TableCell style={{ fontWeight: 'bold' }}>Titles</TableCell>
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {overlaps.map((overlap, index) => (
                          <TableRow key={index}>
                              <TableCell>{formatDate(overlap.start)}</TableCell>
                              <TableCell>{formatDate(overlap.end)}</TableCell>
                              <TableCell>{overlap.titles.join(', ')}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </TableContainer>
      </div>
  </div>
);
}

export default App;
