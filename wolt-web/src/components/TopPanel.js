import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './TopPanel.css';

function TopPanel() {
  const navigate = useNavigate();
  
  const { isLoggedIn, username, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="top-panel">
      <div className="top-panel-logo" onClick={() => navigate('/')}>
        <span className="brand-text">Wolt</span><span className="clone-text">Clone</span>
      </div>
      {isLoggedIn ? (
        <>
          <div className="user-profile">
            <span className="user-name">Hello, {username}</span>
            <button className="btn-logout" onClick={handleLogout}>Log Out</button>
          </div>
          <button className="btn-adress" onClick={() => navigate('/address')}>Set Address</button>

         </>

        ) : (
          <>
            <button className="btn-login" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
            <button className="btn-adress" onClick={() => navigate('/address')}>Set Address</button>
          </>
        )}

      <div className="top-panel-search">
        <input type="text" placeholder="Search for restaurants..." className="search-input"/>
      </div>

      <div className="top-panel-actions">
        
        
      </div>
    </header>
  );
}

export default TopPanel;