import React from 'react';
import moment from 'moment';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarComponent from './Calendar';

import './css/homepage.css';
import './css/nav.css';


const Homepage = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();
    const username = localStorage.getItem('user');

    const handleLogout = () => {
        // Briše token iz lokalne pohrane
        localStorage.removeItem('token');
        // Preusmjerava korisnika na početnu stranicu ili stranicu za prijavu
        navigate('/');
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}` // Dodavanje tokena u zaglavlje
                    }
                };
    
                const response = await fetch('http://localhost:5000/api/events', requestOptions);
            
                if (response.ok) {
                    const data = await response.json();
                    // Pretvori podatke u format događaja
                    //console.log(data);
                    const formattedEvents = data.map(event => {
                        //console.log('Date:', event.dateofevent);
                        //console.log('Time:', event.timeofevent);
                        const dateString = moment(event.dateofevent).format('YYYY-MM-DD');
                        const datetimeString = dateString + 'T' + event.timeofevent;
                        //console.log('DateTime String:', datetimeString);
                        const startDateTime = moment(datetimeString);
                        const endDateTime = startDateTime.clone().add(1, 'hour');
                        //console.log('Start DateTime:', startDateTime);
                        //console.log('End DateTime:', endDateTime);
                        return {
                            title: event.title,
                            start: startDateTime.toDate(),
                            end: endDateTime.toDate(),
                            description: event.description
                        };
                    });
                    
                    setEvents(formattedEvents);
                    checkNotificationSettings(data);
                } else {
                    console.error('Failed to fetch events');
                }
            } catch (error) {
                console.error('Error fetching events:', error.message);
            }
        };

        fetchEvents();
    }, []);

    const checkNotificationSettings = async (events) => {
        const eventIds = events.map(event => event.event_id);
        console.log(eventIds);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/notificationsettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventIds)
            });
    
            if (response.ok) {
                const notificationSettings = await response.json();

                notificationSettings.forEach(setting => {
                    const { event_id, repeatcount, notificationinterval, dateofevent, timeofevent, title } = setting;
                    //console.log("setting: ", setting.repeatcount);
                    if (repeatcount !== null && notificationinterval !== null) {
                        // Pretvori notificationInterval u milisekunde (1 minuta = 60000 ms)
                        const intervalInMs = notificationinterval * 60000;
                
                        // Dohvat trenutnog vremena
                        const currentTime = new Date().getTime();
                        console.log("current time:", currentTime);
                
                        const dateString = moment(dateofevent).format('YYYY-MM-DD');
                        const datetimeString = dateString + 'T' + timeofevent;
                        console.log("new date time: ", datetimeString);
                        console.log("date time:", dateofevent);
                        console.log("time time:", timeofevent);
                        const dateTimeString = `${datetimeString.substring(0, 10)} ${timeofevent}`;
                        const eventDateTime = moment(dateTimeString);
                        console.log("eventdatetimemoment: ", eventDateTime);
                        const eventTime = eventDateTime.isValid() ? eventDateTime.valueOf() : NaN;


                        console.log("event time: ", eventTime);
                
                        // Izračun razlike između trenutnog vremena i vremena događaja
                        const timeDiff = eventTime - currentTime;

                        console.log("timediff: ", timeDiff);
                
                        // Izračun broja notifikacija koje treba poslati
                        const numNotifications = Math.ceil(timeDiff / intervalInMs);
                
                        // Provjeri je li događaj u budućnosti
                        if (timeDiff > 0) {
                            // Iteriraj kroz broj notifikacija i stvori ih
                            for (let i = 1; i <= repeatcount; i++) {
                                let notificationTime = eventTime - Math.ceil(intervalInMs / i);
                                console.log("notificationTime: ", notificationTime);
                                let notificationDate = new Date(notificationTime);
                                console.log('Notification should be sent at:', notificationDate);
                
                                const currentTime = new Date().getTime();
                                if (currentTime < notificationTime && currentTime < eventTime) {
                                    const timeDiff = notificationTime - currentTime;
                                
                                    // Postavljanje setTimeout za prikazivanje notifikacije nakon određenog vremena
                                    setTimeout(() => {
                                        const notificationOptions = {
                                            body: `Notification for ${title}`
                                        };
                                
                                        if (!("Notification" in window)) {
                                            console.error("This browser does not support desktop notification");
                                        } else if (Notification.permission === "granted") {
                                            new Notification('Event Notification', notificationOptions);
                                        } else if (Notification.permission !== "denied") {
                                            // Ako dozvola još nije zatražena, zatraži ju
                                            Notification.requestPermission().then(function (permission) {
                                                if (permission === "granted") {
                                                    // Ako je korisnik odobrio, stvori notifikaciju
                                                    new Notification('Event Notification', notificationOptions);
                                                }
                                            });
                                        }
                                    }, timeDiff);
                                }

                                   
                                    
                                
                            }
                        }
                    }
                });
            } else {
                console.error('Failed to fetch notification settings');
            }
        } catch (error) {
            console.error('Error fetching notification settings:', error.message);
        }
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
                
                <div className='calendar-container'>
                    <CalendarComponent events={events} />
                </div>
            </div>
        </div>
    );
};

export default Homepage;
