import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import FormModal from '../components/FormModal';
import './ProfilePage.css';

// UPDATED: keys now exactly match the backend model requirements
const userFields = [
    { name: 'imageUrl', label: 'Profile Photo', type: 'file', required: false },
    { name: 'name', label: 'Full Name', placeholder: 'Enter your full name', required: true },
    { name: 'displayName', label: 'Display Name', placeholder: 'Enter your display name', required: true },
    { name: 'password', label: 'New Password', type: 'password', placeholder: 'Enter new password (leave blank to keep current)', required: false },
    { name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your new password', required: false },
    { name: 'phoneNum', label: 'Phone Number', type: 'tel', placeholder: 'Enter your phone number', required: true },
    { name: 'address', label: 'Address', placeholder: 'Enter your address', required: true },
];

function ProfilePage() {
    const { userData, isLoggedIn, editUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [showEditUser, setShowEditUser] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the user's full details when the component mounts
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            let idToFetch = userData?.userId;

            if (!idToFetch) {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        idToFetch = payload.id || payload._id || payload.userId;
                    } catch (e) {
                        console.error("Failed to decode JWT token:", e);
                    }
                }
            }

            if (!idToFetch) {
                console.warn("Aborting fetch: No User ID found in context or token payload.");
                setLoading(false);
                return;
            }

            try {
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

    // COMPLETED: Call editUser from context and pass the form data
const handleEditUser = async (formData) => {
        const result = await editUser(userData.userId, formData);
        
        if (result.success) {
            setProfile(result.data);
            setShowEditUser(false);
        } else {
            alert(result.error); 
        }
    };

    const validateEditForm = (submitData) => {
        const errors = {};
        if (submitData.password || submitData.confirmPassword) {
            if (submitData.password !== submitData.confirmPassword) {
                errors.confirmPassword = "Passwords do not match";
            }
        }
        return errors;
    };

    const displayPhoto = profile.profilePhoto || profile.photo || profile.imageUrl || userData?.profilePhoto;

    return (
        <div className="profile-page-container">
            {/* ... Profile Header ... */}
            <div className="profile-card">
                <div className="profile-avatar-section">
                    <div className="large-avatar">
                        {displayPhoto ? (
                            <img
                                src={displayPhoto}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        ) : (
                            <span>{getInitials(profile.name)}</span>
                        )}
                    </div>
                    <h2 className="profile-name">
                        {profile.name}
                        <>
                            <button className="edit-pencil-btn" onClick={() => setShowEditUser(true)} aria-label="Edit">✏️</button>
                        </>
                    </h2>
                    {/* Added display for Display Name right under the main name */}
                    <p className="profile-display-name">{profile.displayName}</p>
                </div>

                <div className="profile-details-section">
                    <div className="detail-row">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-value">{profile.name || 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Display Name</span>
                        <span className="detail-value">{profile.displayName || 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Phone Number</span>
                        <span className="detail-value" dir="ltr">{profile.phoneNum || 'N/A'}</span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Saved Address</span>
                        <span className="detail-value">{profile.address || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <FormModal
                isOpen={showEditUser}
                onClose={() => setShowEditUser(false)}
                title="Edit Profile"
                fields={userFields}
                initialValues={{
                    name: profile.name || '',
                    displayName: profile.displayName || '', // Pass existing Display Name to the form
                    phoneNum: profile.phoneNum || '',
                    address: profile.address || '',
                    imageUrl: displayPhoto || ''
                }}
                validate={validateEditForm}
                submitLabel="Save Changes"
                onSubmit={handleEditUser}
            />
        </div>
    );
}

export default ProfilePage;