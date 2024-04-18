import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/de'; // Ensure German locale
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('de'); // Set moment to use the German locale globally
const localizer = momentLocalizer(moment);

const CalendarApp = ({ events, selectedDates, setSelectedDates }) => {
    const handleSelectSlot = (slotInfo) => {
        const dateStr = moment(slotInfo.start).format('YYYY-MM-DD'); // Normalize date
        let newSelectedDates = new Set(selectedDates);
        if (newSelectedDates.has(dateStr)) {
            newSelectedDates.delete(dateStr);
        } else {
            newSelectedDates.add(dateStr);
        }
        setSelectedDates(new Set(newSelectedDates)); // Ensure React recognizes the change
    };

    const eventStyleGetter = (event, start, end, isSelected) => {
        const startStr = moment(start).format('YYYY-MM-DD');
        const style = {
            backgroundColor: selectedDates.has(startStr) ? '#ff9800' : event.color, // Highlight selected dates
            borderRadius: '0px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    const dayPropGetter = (date) => {
        console.log
        const dateStr = moment(date).format('YYYY-MM-DD');
        return {
            style: {
                backgroundColor: selectedDates.has(dateStr) ? '#f0f0f0' : 'none',
            }
        };
    };

    return (
        <div style={{ height: 700 }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                selectable="ignoreEvents"
                onSelectSlot={handleSelectSlot}
                eventPropGetter={eventStyleGetter}
                dayPropGetter={dayPropGetter} // Apply day-specific styles
            />
        </div>
    );
};

export default CalendarApp;
