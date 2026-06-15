import "./AddressModal.css";
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import { AuthContext } from "../context/AuthContext";

function AddressModal({ isOpen, onClose, onSave }) {
    const { isLoggedIn, userData, setUserData } = useContext(AuthContext);
    
    const [country, setCountry] = useState("Israel");
    const [address, setAddress] = useState("");
    
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            const currentFullAddress = userData?.address || localStorage.getItem('address') || "";
            const hasComma = currentFullAddress.includes(",");
            
            if (hasComma) {
                setCountry(currentFullAddress.split(",")[0].trim());
                setAddress(currentFullAddress.split(",").slice(1).join(",").trim());
            } else {
                setCountry("Israel");
                setAddress(currentFullAddress.trim());
            }
        }
    }, [isOpen, userData?.address]);

    if (!isOpen) return null;

    // Made the function async to handle the API call
    const handleSave = async () => { 
        const fullAddress = `${country}, ${address}`;

        // Check if the user is logged in - if so, update the server
        if (isLoggedIn && userData) {
            try {
                // 1. Extract the user ID from the JWT token
                const token = localStorage.getItem('accessToken');
                if (token) {
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    const userId = tokenPayload.id;

                    // 2. Send the new address to the Node.js server
                    // Note: If your backend expects a PUT request instead of PATCH, change the method here
                    const response = await apiFetch(`/users/${userId}`, {
                        method: 'PATCH', 
                        body: JSON.stringify({ address: fullAddress })
                    });

                    if (!response.ok) {
                        console.error("Failed to update address on server");
                    }
                }
            } catch (error) {
                console.error("Error updating address:", error);
            }

            // 3. Update the local state so the UI refreshes immediately
            const updatedUserData = {
                ...userData,
                address: fullAddress
            };
            if (setUserData) {
                setUserData(updatedUserData);
            }
        }
        
        // 4. Save to localStorage as well (useful for guest users who are not logged in)
        localStorage.setItem('address', fullAddress);

        if (onSave) {
            onSave(fullAddress);
        }
        
        onClose();

        if (location.pathname === "/") {
            navigate("/discovery");
        }
    };

    const isDisabled = address.trim() === "";

    return (
        <div className="modal-overlay">
            <div className="modal">

                <button className="close-btn" onClick={onClose}>
                    ✕
                </button>

                <h2>Delivery Address</h2>

                <label>Country</label>
                <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                >
                    <option value="Israel">Israel</option>
                    <option value="United States">United States</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                </select>

                <label>Address</label>
                <input
                    type="text"
                    placeholder="City, Street name, House number"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={isDisabled}
                >
                    Save Address
                </button>

            </div>
        </div>
    );
}

export default AddressModal;