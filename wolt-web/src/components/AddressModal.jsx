import "./AddressModal.css";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AddressModal({ isOpen, onClose, onSave }) {
    const [country, setCountry] = useState("Israel");
    const [address, setAddress] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSave = () => {
        const fullAddress = `${country}, ${address}`;

        onSave(fullAddress);
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