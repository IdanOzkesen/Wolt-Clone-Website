import "./AddressModal.css";
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

    const handleSave = () => {
        const fullAddress = `${country}, ${address}`;

        if (isLoggedIn && userData) {
            const updatedUserData = {
                ...userData,
                address: fullAddress
            };
            
            if (setUserData) {
                setUserData(updatedUserData);
            }
        }
        
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