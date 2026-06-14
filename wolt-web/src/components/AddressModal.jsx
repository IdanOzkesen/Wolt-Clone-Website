import "./AddressModal.css";
import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AddressModal({ isOpen, onClose, onSave }) {
    // Extract state and the setter function from the global authentication context
    const { isLoggedIn, userData, setUserData } = useContext(AuthContext);

    const initialFullAddress = userData.address;
    // Dynamically split the address by the first comma
    const hasComma = initialFullAddress.includes(",");
    const countryPart = hasComma ? initialFullAddress.split(",")[0].trim() : "Israel";
    const addressPart = hasComma ? initialFullAddress.split(",").slice(1).join(",").trim() : initialFullAddress.trim();

    // Set the dynamic initial states
    const [country, setCountry] = useState(countryPart);
    const [address, setAddress] = useState(addressPart);
    const location = useLocation();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSave = () => {
        const fullAddress = `${country}, ${address}`;

        if (isLoggedIn && userData) {
            // Creating a clean, deep copy of the object to force React to trigger a re-render
            const updatedUserData = {
                ...userData,
                address: fullAddress
            };

            if (setUserData) {
                setUserData(updatedUserData);
            }

            localStorage.setItem('address', fullAddress);
        }

        // Trigger the prop callback to update the parent state as well
        onSave(fullAddress);
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