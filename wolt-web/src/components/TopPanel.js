import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AddressModal from "./AddressModal";
import "./TopPanel.css";

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
        <div className="top-panel-logo" onClick={() => navigate("/")}>
          <span className="brand-text">Wolt</span>
          <span className="clone-text">Clone</span>
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
          <button
            className="btn-address"
            onClick={() => setShowAddressModal(true)}
          >
            {displayAddress}
          </button>

          {/* Auth */}
          {isLoggedIn ? (
            <div className="user-profile">
              <span className="user-name">Hello, {displayName}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={() => navigate("/login")}>
                Log In
              </button>
              <button className="btn-signup" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </>
          )}

          {/* 🌙 RIGHT MOST BUTTON */}
          <button className="btn-theme" onClick={toggleTheme}>
            {darkMode ? "let there be light 🧙 ☀️" : "the dark knight rises 🦇 🌙"}
          </button>

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