import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import './ProfilePage.css';

function ProfilePage() {
    const { userData, isLoggedIn } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the user's full details when the component mounts
    useEffect(() => {
        const fetchUserProfile = async () => {
            // 1. If not logged in at all, stop here.
            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            // 2. Attempt to get the ID from the Context first
            let idToFetch = userData?.userId;

            // 3. Fallback mechanism: If the Context is missing the ID (e.g., stale localStorage),
            // we decode the JWT payload directly to extract the user ID.
            if (!idToFetch) {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    try {
                        // JWT is structured as Header.Payload.Signature
                        // We split by '.' and decode the Payload (index 1) using atob()
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        
                        // Check common MongoDB/Node.js ID field names
                        idToFetch = payload.id || payload._id || payload.userId;
                    } catch (e) {
                        console.error("Failed to decode JWT token:", e);
                    }
                }
            }

            // 4. If we still don't have an ID, abort the fetch.
            if (!idToFetch) {
                console.warn("Aborting fetch: No User ID found in context or token payload.");
                setLoading(false);
                return;
            }

            try {
                // Execute the network request using the safely extracted ID
                const response = await apiFetch(`/users/${idToFetch}`, { 
                    method: 'GET' 
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile details');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                console.error("Profile fetch error:", err);
                setError("Could not load profile. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [isLoggedIn, userData]);

    // Helper function to extract initials for the avatar fallback
    const getInitials = (name) => {
        if (!name) return "";
        const words = name.trim().split(" ");
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return words[0][0].toUpperCase();
    };

    if (loading) {
        return (
            <div className="profile-page-container flex-center">
                <div className="loader">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-page-container flex-center">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-page-container flex-center">
                <h2>No profile data found.</h2>
            </div>
        );
    }

    // Determine the photo to display
    const displayPhoto = profile.photo || profile.imageUrl || userData?.profilePhoto;

    return (
        <div className="profile-page-container">
            <div className="profile-header">
                <h1>My Profile</h1>
                <p>Your personal account details</p>
            </div>

            <div className="profile-card">
                <div className="profile-avatar-section">
                    <div className="large-avatar">
                        {displayPhoto ? (
                            <img src={displayPhoto} alt="Profile" />
                        ) : (
                            <span>{getInitials(profile.name)}</span>
                        )}
                    </div>
                    <h2 className="profile-name">{profile.name}</h2>
                </div>

                <div className="profile-details-section">
                    <div className="detail-row">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-value">{profile.name || 'N/A'}</span>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-label">Phone Number</span>
                        <span className="detail-value" dir="ltr">{profile.phoneNum || 'N/A'}</span>
                    </div>
                    
                    <div className="detail-row">
                        <span className="detail-label">Saved Address</span>
                        <span className="detail-value">{profile.address || 'N/A'}</span>
                    </div>

                    {/* Notice informing the user that editing is disabled */}
                    <div className="profile-notice">
                        <span className="info-icon">ℹ️</span>
                        <span>Profile details cannot be updated at this time.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;