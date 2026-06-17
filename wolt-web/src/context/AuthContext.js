// src/context/AuthContext.js
import React, { createContext, useState } from 'react';
import { apiFetch } from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const savedToken = localStorage.getItem('accessToken');
  const savedUserName = localStorage.getItem('name');
  const savedUserId = localStorage.getItem('userId'); // <-- Read the saved ID from persistent storage

  // Initialize state using the token as the single source of truth to prevent UI desync
  const [userData, setUserData] = useState(() => {
    if (savedToken) {
      return {
        userId: savedUserId || "", // <-- Inject the ID into the initial state upon refresh/restart
        name: savedUserName || "",
        userDisplayName: localStorage.getItem('userDisplayName') || "",
        address: localStorage.getItem('address') || "",
        profilePhoto: localStorage.getItem('profilePhoto') || ""
      };
    }
    return null;
  });

  // Rely solely on the token existence to determine login state
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedToken);

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

        const userId = data.id;
        if (userId) {
          localStorage.setItem('userId', String(userId));
        }

        const userDataToSave = {
          userId: data.userId || "", // <-- Extract and save the ID from the server response
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
        const userId = data.userId || tokenPayload.userId;

        const userResponse = await apiFetch(`/users/${userId}`, {
          method: 'GET'
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          return { success: false, error: errorData.error || "Failed to retrieve user data." };
        }

        const userInfo = await userResponse.json();
        const resolvedUserId = userInfo.userId || userId;

        if (resolvedUserId) {
          localStorage.setItem('userId', String(resolvedUserId));
        }

        const userDataToSave = {
          userId: userId, // <-- Save the ID extracted from the JWT payload
          name: userInfo.name || formData.userName,
          userDisplayName: userInfo.userDisplayName || userInfo.name || formData.userName,
          address: userInfo.address || "",
          profilePhoto: userInfo.profilePhoto || ""
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
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiFetch('/token/logout', {
          method: 'POST',
          body: JSON.stringify({ token: refreshToken })
        });
      }
    }
    catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUserData(null);
      setIsLoggedIn(false);

      // Clears everything including the newly saved 'id'
      localStorage.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ signup, login, logout, userData, isLoggedIn, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}