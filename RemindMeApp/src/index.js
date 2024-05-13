import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Homepage from './components/Homepage'; 
import Register from './components/Register'; 
import AddEvent from './components/AddEvent'; 
import NotificationComponent from './components/NotificationComponent';

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/add" element={<AddEvent />} />
      <Route path="/notifications" element={<NotificationComponent />} />
    </Routes>
  </Router>,
  document.getElementById('root')
);

reportWebVitals();
