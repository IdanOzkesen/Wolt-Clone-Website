import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Buttons"; 
import AddressModal from "../components/AddressModal"; // Imported the modal component
import "./LandPage.css";

const LandPage = () => {
  const navigate = useNavigate();
  // State to control the visibility of the address modal
  const [showAddressModal, setShowAddressModal] = useState(false);

  return (
    <div className="LandPage-container">
      <section className="hero">
        <div className="hero-content">

          <h1>
            What should we deliver<br />
            for you today?
          </h1>

          <div className="address-box">
            <span className="geo-icon" role="img" aria-label="location">📍</span>

            <input
              type="text"
              placeholder="Where should we deliver your order?"
              readOnly // Prevents typing directly into the input
              onClick={() => setShowAddressModal(true)} // Opens modal on input click
              style={{ cursor: 'pointer' }} // Changes cursor to indicate it's clickable
            />

            {/* Search button triggers the address modal */}
            <Button variant="primary" onClick={() => setShowAddressModal(true)}>
              Search
            </Button>
          </div>

          <button
            className="login-hint-btn"
            onClick={() => navigate("/login")}
          >
            Log in to see your saved addresses
          </button>

        </div>
      </section>

      <section className="content">
        <div className="cards-container">

          <div className="card">
            <div className="card-overlay">
              <h2>New customers waiting for you</h2>
              <p>Join our platform and grow your business.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-overlay">
              <h2>Deliver at your own pace</h2>
              <p>Flexible work and great earnings.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Mount the modal component and control its state */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        // onSave is handled internally by the modal itself, including navigation
      />
    </div>
  );
};

export default LandPage;