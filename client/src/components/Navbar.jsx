import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/Navbar.css';
import axios from 'axios';

import pp_default from '../assets/images/pp_default.png';
import pp_admin from '../assets/images/pp_admin.png';

const Navbar = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [showPopover, setShowPopover] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getUserInformation();
        checkAdminStatus();
    }, []);

    const checkAdminStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in local storage');
            navigate('/');
            return;
        }
    
        try {
            const response = await axios.get('http://localhost:5001/users/isAdmin', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            console.log('Admin status:', response.data);
            setIsAdmin(response.data.isAdmin);
        } catch (error) {
            console.error('Error during API request:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            console.error('Error config:', error.config);
        }
    };

    const getUserInformation = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in local storage');
            return;
        }
    
        try {
            const response = await axios.get('http://localhost:5001/users/me', {
                headers: {
                    'Authorization': `${token}`
                }
            });
            setUsername(response.data.username);
            setEmail(response.data.email);
        } catch (error) {
            if(error.status === 401) {
                console.error('You are not connected');
                navigate('/'); // Redirect to login page

            }
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request data:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            console.error('Error config:', error.config);
        }
    };

    const handleMouseEnter = () => {
        setShowPopover(true);
    };

    const handleMouseLeave = () => {
        setShowPopover(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/home">Quiz Project</Link>
            </div>
            <div className="navbar-menu">
                <Link to="/home">Liste des quiz</Link>
                <Link to="/home">Classement général</Link>
            </div>
            <div 
                className="navbar-name" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
            >
                <img src={isAdmin ? pp_admin : pp_default} alt="Profile" />
                <p>{username} {isAdmin ? '[ADMIN]' : ''}</p>
                {showPopover && (
                    <div className="popover-menu">
                        <p>{email}</p>
                        <div className="line"></div>
                        <Link to="/profile">Mon profil</Link>
                        <Link to="/history">Historique</Link>
                        {isAdmin && <Link to="/admin">Outils Admin</Link>}
                        <div className="line"></div>
                        <Link to="/logout" className='logout'>Se déconnecter</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;