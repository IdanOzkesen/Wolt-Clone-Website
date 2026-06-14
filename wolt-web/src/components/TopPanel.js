import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AddressModal from "./AddressModal";
import {logout} from "../services/api";
import "./TopPanel.css";

function TopPanel() {
  const navigate = useNavigate();
  const { isLoggedIn, username } = useContext(AuthContext);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState("");

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
    navigate("/");
  };

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
            {address ? address : "Set Address"}
          </button>

          {/* Auth */}
          {localStorage.getItem('accessToken') ? (
            <div className="user-profile">
              <span className="user-name">Hello, {username}</span>
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