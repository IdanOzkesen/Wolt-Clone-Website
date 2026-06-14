// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import { apiFetch } from "../services/api";


// Create the AuthContext
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize state based on localStorage
  const hasUser = localStorage.getItem('userName');

  const [userData, setUserData] = useState(
    hasUser
      ? {
        userName: localStorage.getItem('userName'),
        userDisplayName: localStorage.getItem('userDisplayName'),
        address: localStorage.getItem('address'),
        profilePhoto: localStorage.getItem('profilePhoto')
      }
      : null
  );

  const [isLoggedIn, setIsLoggedIn] = useState(!!userData);

  const signup = async (formData) => {
    const userDataToSend = {
      name: formData.userName,
      password: formData.password,
      address: formData.address,
      phoneNum: formData.phoneNumber
    };

    try {
      const response = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userDataToSend)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        const userDataToSave = {
          name: formData.userName,
          userDisplayName: formData.userDisplayName,
          address: formData.address,
          profilePhoto: formData.profilePhoto
        };

        for (const [key, value] of Object.entries(userDataToSave)) {
          localStorage.setItem(key, value);
        }

        setUserData(userDataToSave);
        setIsLoggedIn(true);

        return { success: true }

      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Signup failed. Please try again." };
      }
    } catch (err) {
      return { success: false, error: "Network error. Please check if the server is running." };
    }
  }

  const login = async (formData) => {
    const userDataToSend = {
      name: formData.userName,
      password: formData.password
    };

    try {
      const response = await apiFetch('/token', {
        method: 'POST',
        body: JSON.stringify(userDataToSend)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        const userId = data.id;

        const userResponse  = await apiFetch('/users/userId', {
          method: 'GET',
          body: { 'accessToken': 'Bearer ${tokenData.accessToken}' }
        });

        if (!userResponse.ok) {
          const errorData = await response.json();
          return { success: false, error: errorData.error || "Failed to retrieve user data." };
        }

        const userInfo = await userResponse.json();

        const userDataToSave = {
          name: userInfo.userName,
          userDisplayName: userInfo.userDisplayName,
          address: userInfo.address,
          profilePhoto: userInfo.profilePhoto
        };

        for (const [key, value] of Object.entries(userDataToSave)) {
          localStorage.setItem(key, value);
        }

        setUserData(userDataToSave);
        setIsLoggedIn(true);
        return { success: true }

      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Login failed. Please try again." };
      }
    } catch (err) {
      return { success: false, error: "Network error. Please check if the server is running." };
    }
  }

    const logout = async (formData) => {
      setUserData(null);
      setIsLoggedIn(false);
      localStorage.clear();
    }

  return (
    <AuthContext.Provider value={{ signup, userData, AuthContext, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}