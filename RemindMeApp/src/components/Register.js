import { useNavigate } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import './css/register.css';
import calendarIcon from './images/calendarIcon.png';
import { Link } from 'react-router-dom'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
  
    const handleEmailChange = (e) => {
      setEmail(e.target.value);
    };
  
    const handlePassChange = (e) => {
      setPass(e.target.value);
    };

    const handleUsernameChange = (e) => {
      setUsername(e.target.value);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const response = await fetch('http://localhost:5000/api/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ username, email, pass })
          });

          if (response.ok) {
              console.log('User registered successfully');
              navigate('/');
          } else {
              console.log('Registration failed');
              setError('Username already exists');
          }
      } catch (err) {
          console.error('Error during registration:', err.message);
          setError('Error during registration. Please try again');
      }
    };
  
    return (
        <div className='body'>
            <div className="container-register">
                <img src={calendarIcon} alt="Calendar" className="image" />
                <div className="container2">
                    <div className="main">
                        <p className="login" align="center">Sign in</p>
                        <form className="form1" onSubmit={handleSubmit}>
                            <input className="un" type="text" align="center" placeholder="Username" onChange={handleUsernameChange} value={username} />
                            <input className="em" type="text" align="center" placeholder="Email" onChange={handleEmailChange} value={email} />
                            <input className="pass" type="password" align="center" placeholder="Password" onChange={handlePassChange} value={pass} />
                            {/*<input className="pass2" type="password" align="center" placeholder="Repeat Password" onChange={handlePasswordChange} value={password} />*/}
                            
                            <button type="submit" className="submit" align="center">Sign in</button>
                            <p className="error">{error}</p>
                            <Link to="/">
                            <p className="register" align="center"><a href="#">Already have an account?</a></p>
                            </Link>
                            
                        </form>
                    </div>
                    
                </div>
                
            </div>
        </div>
        
      );
  };
  
  export default Login;
