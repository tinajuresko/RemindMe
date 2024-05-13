import React from 'react';

const CustomAgenda = ({ events }) => {
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
        </div>
      ))}
    </div>
  );
};

export default CustomAgenda;
