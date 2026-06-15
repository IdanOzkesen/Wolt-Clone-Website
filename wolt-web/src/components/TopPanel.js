import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AddressModal from "./AddressModal";
import Button from "./Buttons"; 
import "./TopPanel.css";
import woltLogo from "../assets/logo.png";

function TopPanel() {
  const navigate = useNavigate();
  const { isLoggedIn, userData, logout } = useContext(AuthContext);

  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Lazily initialize the address state from localStorage to persist guest data across F5 refreshes
  const [address, setAddress] = useState(() => localStorage.getItem('address') || "");

  // 🌙 Theme state
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);

    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    logout();
    // No need to navigate here, the AuthContext logout function safely handles the redirection
  };

  const displayName = userData?.userDisplayName || "";

  // Priority: 1. Logged-in user data, 2. Current local session state (including guest localStorage), 3. Default text
  const displayAddress = userData?.address || address || "Set Address";

  return (
    <>
      <header className="top-panel">
        {/* Interactive Logo Wrapper */}
        <div className="top-panel-logo-wrapper" onClick={() => navigate("/")}>
          <img 
            src={woltLogo} 
            alt="Wolt Clone" 
            className="top-panel-circular-logo" 
          />
        </div>

        <div className="top-panel-search">
          <input
            type="text"
            placeholder="Search for restaurants..."
            className="search-input"
          />
        </div>

        <div className="top-panel-actions">

          {/* Address */}
          <Button variant="secondary" onClick={() => setShowAddressModal(true)}>
            {displayAddress}
          </Button>

          {/* Auth */}
          {isLoggedIn ? (
            <div className="user-profile">
              <span className="user-name">Hello, {displayName}</span>
              <Button variant="secondary" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="secondary" onClick={() => navigate("/login")}>
                Log In
              </Button>
              <Button variant="primary" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </>
          )}

          {/* 🌙 RIGHT MOST BUTTON */}
          <Button variant="secondary" onClick={toggleTheme}>
            {darkMode ? "let there be light 🧙 ☀️" : "the dark knight rises 🦇 🌙"}
          </Button>

        </div>
      </header>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={(fullAddress) => {
          setAddress(fullAddress);
        }}
      />
    </>
  );
}

export default TopPanel;