// src/context/AuthContext.js
import React, { createContext, useState } from 'react';

// Create the AuthContext
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize state based on localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);

  // Function to handle login and store JWT token in localStorage
  const login = (token, name) => {
    localStorage.setItem('jwt_token', token);
    setIsLoggedIn(true);
    setUsername(name);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token'); 
    setIsLoggedIn(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}