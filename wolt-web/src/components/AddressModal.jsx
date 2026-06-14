import "./AddressModal.css";
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Import the AuthContext to sync user data
import { AuthContext } from "../context/AuthContext";

function AddressModal({ isOpen, onClose, onSave }) {
    const { isLoggedIn, userData, setUserData } = useContext(AuthContext);
    
    const [country, setCountry] = useState("Israel");
    const [address, setAddress] = useState("");
    
    const location = useLocation();
    const navigate = useNavigate();

    // Re-sync the modal's input fields every time the modal is opened
    useEffect(() => {
        if (isOpen) {
            // Fetch data from Context first, fallback to localStorage, then empty string
            const currentFullAddress = userData?.address || localStorage.getItem('address') || "";
            
            // Dynamically split the address to pre-fill the inputs correctly
            const hasComma = currentFullAddress.includes(",");
            
            if (hasComma) {
                setCountry(currentFullAddress.split(",")[0].trim());
                setAddress(currentFullAddress.split(",").slice(1).join(",").trim());
            } else {
                // If there's no comma, assume the country is Israel and put everything in the address field
                setCountry("Israel");
                setAddress(currentFullAddress.trim());
            }
        }
    }, [isOpen, userData?.address]);

    if (!isOpen) return null;

    const handleSave = () => {
        const fullAddress = `${country}, ${address}`;

        // Update the global AuthContext and localStorage
        if (isLoggedIn && userData) {
            const updatedUserData = {
                ...userData,
                address: fullAddress
            };
            
            // Update the React state inside the context
            if (setUserData) {
                setUserData(updatedUserData);
            }
        }
        
        // Always update localStorage so guest users also have their address saved
        localStorage.setItem('address', fullAddress);

        // Notify the parent component (TopPanel)
        if (onSave) {
            onSave(fullAddress);
        }
        
        onClose();

        // If we're on the home page, navigate to the discovery page after saving the address
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