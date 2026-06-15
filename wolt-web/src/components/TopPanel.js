import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AddressModal from "./AddressModal";
import Button from "./Buttons";
import "./TopPanel.css";
import woltLogo from "../assets/logo.png";
import { useCart } from '../context/CartContext'; 
import CartSidebar from './CartSidebar';

function TopPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, userData, logout } = useContext(AuthContext);
  
  // Cart States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItemsCount } = useCart();
  
  // Address States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState(() => localStorage.getItem('address') || "");

  // Sync address from localStorage whenever the route changes
  useEffect(() => {
    const storedAddress = localStorage.getItem('address');
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, [location.pathname]);

  // Theme state
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
  };

  const displayName = userData?.userDisplayName || "";
  const displayAddress = userData?.address || address || "Set Address";

  // Determine if we are on the LandPage to conditionally hide the search bar
  const isLandPage = location.pathname === "/";

  return (
    <>
      <header className="top-panel">

        {/* LEFT SECTION: Logo & Address */}
        <div className="top-panel-left">
          <div className="top-panel-logo-wrapper" onClick={() => navigate("/")}>
            <img
              src={woltLogo}
              alt="Wolt Clone"
              className="top-panel-circular-logo"
            />
          </div>

          <button className="top-panel-address" onClick={() => setShowAddressModal(true)}>
            <div className="address-icon-wrapper">
              <span role="img" aria-label="location">📍</span>
            </div>
            <span className="address-text">{displayAddress}</span>
            <span className="chevron-icon">⌄</span>
          </button>
        </div>

        {/* MIDDLE SECTION: Search Bar (Hidden on LandPage) */}
        {!isLandPage && (
          <div className="top-panel-search">
            <input
              type="text"
              placeholder="Search in Wolt..."
              className="search-input"
            />
          </div>
        )}

        {/* RIGHT SECTION: Auth, Cart & Theme Actions */}
        <div className="top-panel-actions">
          
          {/* Shopping Cart Toggle Button */}
          <Button variant="secondary" onClick={() => setIsCartOpen(true)}>
            🛒 {totalItemsCount > 0 && <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>({totalItemsCount})</span>}
          </Button>

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

          {/* Theme Toggle Button */}
          <Button variant="secondary" onClick={toggleTheme}>
            {darkMode ? "☀️" : "🌙"}
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

      {/* Cart Sidebar rendered at the root level so it covers the screen properly */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default TopPanel;