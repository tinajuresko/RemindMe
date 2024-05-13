import { useNavigate } from 'react-router-dom';
import { Routes, Route} from 'react-router-dom';
import React, { useState } from 'react';
import './css/login.css';
import calendarIcon from './images/calendarIcon.png';
import { Link } from 'react-router-dom'; 



const Login = () => {
    
    const [username, setUsername] = useState('');
    const [pass, setPass] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    
    const handleUsernameChange = (e) => {
      setUsername(e.target.value);
    };
  
    const handlePassChange = (e) => {
      setPass(e.target.value);
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, pass: pass }) 
            });
    
            if (response.ok) {
                console.log('Logged in successfully');
                const data = await response.json();
                const token = data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('user', username);
                navigate('/homepage');
            } else {
                console.log('Invalid username or password');
                setError('Invalid username or password');
                navigate('/'); 
            }
        } catch (err) {
            console.error('Error during login:', err.message);
            setError('Error during login. Please try again.');
        }
    };
    
    
    
    return (
        <div className='body'>
            <div className="container-login">
                <img src={calendarIcon} alt="Calendar" className="image" />
                <div className="container2">
                    <div className="main">
                        <p className="login" align="center">Log in</p>
                        <form className="form1" onSubmit={handleSubmit}>
                            <input className="em" type="text" align="center" placeholder="Username" onChange={handleUsernameChange} value={username} />
                            <input className="pass" type="password" align="center" placeholder="Password" onChange={handlePassChange} value={pass} />
                            
                            <button type="submit" className="submit" align="center">Log in</button>

                            <p className="error">{error}</p>
                            
                            <Link to="/register">
                            <p className="register" align="center"><a href="#">First time?</a></p>
                            </Link>
                            
                        </form>
                    </div>
                    
                </div>
                
            </div>
        </div>
        
      );
  };
  
  export default Login;
