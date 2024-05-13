import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import './css/calendar.css';
import { useState } from 'react';


const CalendarComponent = ({ events }) => {
  const localizer = momentLocalizer(moment);
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        {/* Calendar komponenta koja proizlazi iz react-big-calendar biblioteke i njezina svojstva (props) */}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 80px)' }}
          components={{
            event: EventComponent
          }}         
       />
      </div>
    </div>
  );
};

const EventComponent = ({ event }) => {
  const [showDescription, setShowDescription] = useState(false);
  const handleMouseEnter = () => {
    setShowDescription(true);
  };

  const handleMouseLeave = () => {
    setShowDescription(false);
  };
  return (
      
    <div className='rbc-event' onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className='titleEvent'><strong>{event.title}</strong></div>
      {showDescription && (
        <p className='event-description'>{event.description}</p>
      )}
    </div>
   
  );
};




export default CalendarComponent;
