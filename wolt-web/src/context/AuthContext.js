// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import { apiFetch, apiLogout } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const savedUserName = localStorage.getItem('name');
  const savedToken = localStorage.getItem('accessToken');

  const [userData, setUserData] = useState(() => {
    if (savedUserName && savedToken) {
      return {
        name: savedUserName,
        userDisplayName: localStorage.getItem('userDisplayName'),
        address: localStorage.getItem('address'),
        profilePhoto: localStorage.getItem('profilePhoto')
      };
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(!!savedToken && !!savedUserName);

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
          profilePhoto: data.profilePhoto || ""
        };

        for (const [key, value] of Object.entries(userDataToSave)) {
          localStorage.setItem(key, value);
        }

        setUserData(userDataToSave);
        setIsLoggedIn(true);
        return { success: true };

      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Signup failed. Please try again." };
      }
    } catch (err) {
      return { success: false, error: "Network error. Please check if the server is running." };
    }
  };

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

        const tokenPayload = JSON.parse(atob(data.accessToken.split('.')[1]));
        const userId = tokenPayload.id;

        const userResponse = await apiFetch(`/users/${userId}`, {
          method: 'GET'
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          return { success: false, error: errorData.error || "Failed to retrieve user data." };
        }

        const userInfo = await userResponse.json();
        
        const userDataToSave = {
          name: userInfo.name || "",
          userDisplayName: userInfo.userDisplayName || "",
          address: userInfo.address || "",
          profilePhoto: userInfo.profilePhoto
        };

        for (const [key, value] of Object.entries(userDataToSave)) {
          localStorage.setItem(key, value);
        }

        setUserData(userDataToSave);
        setIsLoggedIn(true);
        return { success: true };

      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Login failed. Please try again." };
      }
    } catch (err) {
      return { success: false, error: "Network error. Please check if the server is running." };
    }
  };

  const logout = async () => {
    apiLogout();
    setUserData(null);
    setIsLoggedIn(false);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ signup, login, logout, userData, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}