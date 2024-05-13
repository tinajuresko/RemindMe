import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import MuiAlert from "@material-ui/lab/Alert";
import 'react-datepicker/dist/react-datepicker.css';

import './css/addevent.css';
import './css/nav.css';


function Alert(props) {
    return <MuiAlert elevation={6}
        variant="filled" {...props} />;
}

const AddEvent = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateofevent, setDateOfEvent] = useState(new Date().toISOString().slice(0, 10));
  const [timeofevent, setTimeOfEvent] = useState('');
  const [people, setPeople] = useState('');
  const username = localStorage.getItem('user');

  const [notificationInterval, setNotificationInterval] = useState(''); // Vremenski interval u minutama
  const [notificationRepeat, setNotificationRepeat] = useState(''); // Broj ponavljanja
  const [repeat, setRepeat] = useState(''); // Dodano: Stanje za vrstu ponavljanja
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationIntervalChange = (event) => {
    setNotificationInterval(event.target.value);
  };

  const handleRepeatChange = (event) => { // Dodano: Handler za promjenu vrste ponavljanja
    setRepeat(event.target.value);
  };

  const handleNotificationRepeatChange = (event) => {
    setNotificationRepeat(event.target.value);
  };
  
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleDatOfEventeChange = (event) => {
    setDateOfEvent(event.toISOString().slice(0, 10));
  };

  const handleTimeOfEventChange = (event) => {
    setTimeOfEvent(event.target.value);
  };
  const handlePeopleChange = (event) =>{
    setPeople(event.target.value);
  }

  const handleSubmit = async (event) => {
    
    event.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/event', {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          dateofevent,
          timeofevent,
          people,
          repeat,
          notificationInterval: parseInt(notificationInterval),
          notificationRepeat: parseInt(notificationRepeat)
        })
      });
      if (response.ok) {
        console.log('Event added successfully');
        <Alert severity="success">Success Message</Alert>
        navigate('/homepage');
      } else {
        console.error('Failed to add event');
        <Alert severity="error">Failed to add event</Alert>
      }
    } catch (error) {
      console.error('Error adding event:', error.message);
      <Alert severity="error">Error adding event, ${error.message}</Alert>
    }

    setTitle('');
    setDescription('');
    setDateOfEvent(new Date().toISOString().slice(0, 10));
    setTimeOfEvent('');
    setPeople('');
    setNotificationInterval('');
    setNotificationRepeat('');
    setRepeat('');
   
  };

  const handleLogout = () => {
    // Briše token iz lokalne pohrane
    localStorage.removeItem('token');
    // Preusmjerava korisnika na početnu stranicu ili stranicu za prijavu
    navigate('/');
  };



  return (
    <div className='body'>
      
      <div className='container'>
        <nav id="sidebar">
        <ul class="dots">
          <li>
            <a onClick={handleLogout}>
              <span class="glyphicon glyphicon-user"></span>
            </a>  
          </li>
          <li>
              <div className="tooltip" style={{ fontWeight: 'bold', color: 'white' }}>
                {username}
              </div>
          </li>

          <li>
            <a href="/notifications">
              <span class="glyphicon glyphicon-envelope"><mark class="big swing">!</mark></span>
            </a>  
          </li>
          
          <li>
            <a href="/add">
              <span class="glyphicon glyphicon-list-alt"></span>
            </a>
          </li>   

          <li>
            <a href="/homepage">
              <span class="glyphicon glyphicon-calendar"></span>
            </a>
          </li>      
                
        </ul> 
      </nav>



    <div className='content'>
        <div className='main'>
            <h2 className='addEvent'>Add Event</h2>
            <form onSubmit={handleSubmit}>
                <div>
                <label>Title:</label>
                <input className='title' type="text" value={title} onChange={handleTitleChange} required />
                </div>
                <div>
                <label>Description:</label>
                <textarea className='description' value={description} onChange={handleDescriptionChange}/>
                </div>
                <div>
                <label>Date:</label>
                <DatePicker className='date' selected={dateofevent} onChange={handleDatOfEventeChange} dateFormat="MM/dd/yyyy" required />
                </div>
                <div>
                <label>Time:</label>
                <input className='time' type="time" value={timeofevent} onChange={handleTimeOfEventChange} required />
                </div>
                <div>
                <label>Add people:</label>
                <input className='people' type="text" value={people} placeholder='Separate with ","' onChange={handlePeopleChange}  />
                </div>

                <div> {/* Dodano: Polje za odabir vrste ponavljanja */}
                    <label>Repeat Type:</label>
                    <select value={repeat} onChange={handleRepeatChange} style={{'margin-bottom': '17px'}}>
                        <option value="">Select Repeat Type</option>
                        <option value="godisnje">Per year</option>
                        <option value="mjesecno">Monthly</option>
                        <option value="tjedno">Weekly</option>
                        <option value="dnevno">Daily</option>
                    </select>
                </div>

                <button className='submit' type="submit">Add Event</button>
            </form>
        </div>


        <div>
            <div className='main2'>
                <label>Notification Interval (minutes before event):</label>
                <input
                    className='notification-interval'
                    type="number"
                    min="0"
                    value={notificationInterval}
                    onChange={handleNotificationIntervalChange}
                    placeholder="Enter number of minutes"
                />

                <div>
                    <label>Notification Repeat:</label>
                    <input
                        className='notification-repeat'
                        type="number"
                        min="0"
                        value={notificationRepeat}
                        onChange={handleNotificationRepeatChange}
                        placeholder="Enter number of repetitions"
                    />
                </div>
            </div>
                
        </div>
      </div>
    </div>
</div>
  );
};

export default AddEvent;
