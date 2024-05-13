import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

import'./css/notifications.css';
import './css/nav.css';

const NotificationComponent = () => {   

    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [deletedNotifications, setDeletedNotifications] = useState([]);
    const [startIndex, setStartIndex] = useState(0);
    const username = localStorage.getItem('user');

    useEffect(() => {
        fetchNotifications(); // Dohvaćanje notifikacija kada se komponenta montira
    }, []);

    async function fetchNotifications() {
        try {
        const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/notifications', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });
          if (response.ok) {
            const data = await response.json();
            setNotifications(data); // Postavljanje dohvaćenih notifikacija u stanje komponente
            console.log(data);
          } else {
            console.error('Failed to fetch notifications');
          }
        } catch (error) {
          console.error('Error fetching notifications:', error.message);
        }
      }

    function handleNextPage() {
      setStartIndex(prevIndex => prevIndex + 4); // Povećanje indeksa početka za 4
    }

    function handlePrevPage() {
        setStartIndex(prevIndex => Math.max(0, prevIndex - 4)); // Smanjivanje indeksa početka za 4, ali minimalno 0
    }
    const handleDelete = async (eventId) => {
      try {
          const token = localStorage.getItem('token');
          const confirmDelete = window.confirm('Jeste li sigurni da želite obrisati ovu notifikaciju?');
  
          if (confirmDelete) {
              const response = await fetch(`http://localhost:5000/api/notifications/${eventId}`, {
                  method: 'DELETE',
                  headers: {
                      'Authorization': `Bearer ${token}`
                  },
              });
  
              if (response.ok) {
                  // Ako je brisanje uspješno, ažuriraj stanje notifikacija
                  const updatedNotifications = notifications.filter(notification => notification.event_id !== eventId);
                  setNotifications(updatedNotifications);
                  setDeletedNotifications([...deletedNotifications, eventId]);
                  console.log('Notification deleted successfully');
              } else {
                  console.error('Failed to delete notification');
              }
          }
      } catch (error) {
          console.error('Error deleting notification:', error.message);
      }
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
                            <span class="glyphicon glyphicon-list-alt"><mark class="green wobble">+</mark></span>
                          </a>
                        </li> 

                        <li>
                          <a href="/homepage">
                            <span class="glyphicon glyphicon-calendar"></span>
                          </a>
                        </li>      
                            
                    </ul> 
                </nav>


                <div className="notification-list">
                    <h2>Notifications</h2>
                    <div className="notification-container">
                      {notifications.slice(startIndex, startIndex + 4).map(notification => (
                      <div className="notification-card" key={notification.event_id}>
                          <div>
                              <h3>{notification.title}</h3>
                              <p>Date: {(moment(notification.dateofevent).format('YYYY-MM-DD')).toString()}</p>
                              <p>Time: {notification.timeofevent}</p>
                          </div>
                          <div><button className="delete-button" onClick={() => handleDelete(notification.event_id)}>Delete</button></div>
                      </div>
                       ))}
                    </div>
                    <div className="pagination">
                <button className='pagination' onClick={handlePrevPage} disabled={startIndex === 0}>Prev</button>
                <button className='pagination' onClick={handleNextPage} disabled={startIndex + 4 >= notifications.length}>Next</button>
            </div>
                </div>     
        </div>
    </div>
  );
};

export default NotificationComponent;
