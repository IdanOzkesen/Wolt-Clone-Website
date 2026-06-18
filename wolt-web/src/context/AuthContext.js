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
    // Pack the data exactly as your backend expects it (imageUrl for the photo)
    const userDataToSend = {
      name: formData.userName,
      password: formData.password,
      address: formData.address,
      phoneNum: formData.phoneNumber,
      imageUrl: formData.profilePhoto || "" // Sending the Base64 image to the server
    };

    try {
      const response = await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userDataToSend)
      });

      if (response.ok) {
        const data = await response.json();
        
        // 1. Save tokens securely
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // 2. SAFELY extract ID to prevent crashes if data.user is undefined
        const extractedUserId = (data.user && (data.user.id || data.user._id)) || data.userId || data.id || data._id;
        
        if (extractedUserId) {
          localStorage.setItem('userId', String(extractedUserId));
        }

        const userDataToSave = {
          userId: extractedUserId || "",
          name: formData.userName,
          userDisplayName: formData.userDisplayName || formData.userName,
          address: formData.address || "",
          profilePhoto: "" // Default to empty, will safely attempt to save below
        };

        // 3. Save basic text data to LocalStorage first (always safe)
        for (const [key, value] of Object.entries(userDataToSave)) {
          localStorage.setItem(key, value);
        }

        // 4. SAFELY save the heavy Base64 image to prevent QuotaExceededError crashes
        const photoToSave = (data.user && data.user.imageUrl) || data.imageUrl || formData.profilePhoto || "";
        try {
          if (photoToSave) {
            localStorage.setItem('profilePhoto', photoToSave);
            userDataToSave.profilePhoto = photoToSave; // Update state only if storage succeeds
          }
        } catch (e) {
          console.warn("⚠️ Profile photo is too large for LocalStorage. It will be loaded dynamically from the server.");
        }

        // 5. Finalize login state
        setUserData(userDataToSave);
        setIsLoggedIn(true);
        return { success: true };

      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Signup failed. Please try again." };
      }
    } catch (err) {
      console.error("Signup crashed:", err);
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
        
        // 1. First, save the tokens to local storage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // 2. Safe ID extraction: Try getting it from the response, fallback to decoding the JWT token payload
        const tokenPayload = JSON.parse(atob(data.accessToken.split('.')[1]));
        const extractedUserId = (data.user && (data.user.id || data.user._id)) || 
                                tokenPayload.id || tokenPayload._id || tokenPayload.userId;

        // Prevent the app from crashing silently if the ID is nowhere to be found
        if (!extractedUserId) {
           throw new Error("Could not extract user ID from login response or token payload.");
        }

        // 3. Fetch the rest of the user's details from the server using the extracted ID
        const userResponse = await apiFetch(`/users/${extractedUserId}`, {
          method: 'GET'
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          return { success: false, error: errorData.error || "Failed to retrieve user data." };
        }

        const userInfo = await userResponse.json();
        console.log("DEBUG: Server user info:", userInfo);
        const resolvedUserId = userInfo._id || userInfo.id || userInfo.userId || extractedUserId;

        if (resolvedUserId) {
          localStorage.setItem('userId', String(resolvedUserId));
        }

        // 1. Get the photo from multiple possible fields to be safe
        const photoFromServer = userInfo.profilePhoto || userInfo.photo || userInfo.imageUrl || "";

        const userDataToSave = {
          userId: resolvedUserId, 
          name: userInfo.name || formData.userName,
          userDisplayName: userInfo.userDisplayName || userInfo.name || formData.userName,
          address: userInfo.address || "",
          profilePhoto: "" // Start empty
        };

        // 2. Save all TEXT data first (this is safe)
        for (const [key, value] of Object.entries(userDataToSave)) {
          if (key !== 'profilePhoto') {
             localStorage.setItem(key, value);
          }
        }

        // 3. Try to save the heavy image in a separate 'try-catch' block
        try {
          if (photoFromServer) {
            localStorage.setItem('profilePhoto', photoFromServer);
            userDataToSave.profilePhoto = photoFromServer; // Update state
          }
        } catch (e) {
          console.warn("Storage full! Image too large for LocalStorage, skipping local save.");
          // Even if saving fails, the user is still logged in!
        }

        setUserData(userDataToSave);
        setIsLoggedIn(true);
        return { success: true };

      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || "Login failed. Please try again." };
      }
    } catch (err) {
      // Log the actual error to the console for debugging if a crash occurs
      console.error("Login process crashed:", err);
      return { success: false, error: "A system error occurred during login. Check console." };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiFetch('/token/logout', {
          method: 'POST',
          // Matching the exact payload key expected by the backend controller
          body: JSON.stringify({ 
            Refresh_Token: refreshToken 
          })
        });
      }
    }
    catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear everything locally regardless of the server's response
      localStorage.clear();
      setUserData(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ signup, login, logout, userData, isLoggedIn, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}