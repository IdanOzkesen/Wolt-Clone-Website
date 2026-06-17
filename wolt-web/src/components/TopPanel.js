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
  
  // Cart & Dropdown States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { totalItemsCount } = useCart();
  
  // Address States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState(() => localStorage.getItem('address') || "");

  // State for the search input
  const [searchQuery, setSearchQuery] = useState("");

  // Function to handle pressing "Enter" in the search bar
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
      // Navigate to the search page with the query as a URL parameter
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      searchQuery(""); // Optional: clear the search bar after searching
    }
  };

  // Sync address from localStorage whenever the route changes
  useEffect(() => {
    const storedAddress = localStorage.getItem('address');
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, [location.pathname]);

  // ==========================================
  // FIX 1: PERSISTENT DARK MODE (Survives Refresh)
  // ==========================================
  
  // 1. Initialize state by checking localStorage first (Lazy Initialization)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark'; // Returns true if 'dark' is saved, otherwise false
  });

  // 2. React to changes: Update the DOM and save to localStorage whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark'); // Save user preference
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light'); // Save user preference
    }
  }, [darkMode]);

  // 3. Toggle function now only flips the state. The useEffect handles the rest.
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  // ==========================================
  // FIX 2: SMART LOGO ROUTING
  // ==========================================
  const handleLogoClick = () => {
    
    // 1. If the user IS logged in, check if they are on the restaurants feed ('/discovery')
    if (location.pathname === '/discovery') {
      // If already on the restaurants feed, take them to the Landing Page
      navigate('/'); 
    } 
    // 2. From any other page (like '/restaurant/:id'), return them to the restaurants feed
    else {
      navigate('/discovery');
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  // Safe data extraction with fallbacks
  const displayName = userData?.userDisplayName || "";
  const displayAddress = userData?.address || address || "Set Address";
  const profilePhoto = userData?.profilePhoto || ""; 
  const isLandPage = location.pathname === "/";

  // Helper function to extract initials (e.g., "John Doe" -> "JD")
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0][0].toUpperCase();
  };

  return (
    <>
      <header className="top-panel">
        
        {/* LEFT SECTION: Logo & Address */}
        <div className="top-panel-left">
          {/* Changed onClick to use the new smart routing function */}
          <div className="top-panel-logo-wrapper" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src={woltLogo} alt="Wolt Clone" className="top-panel-circular-logo" />
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        )}

        {/* RIGHT SECTION: Actions (Cart, Profile, Theme) */}
        <div className="top-panel-actions">
          
          {/* Circular Cart Button */}
          <button className="icon-circle-btn" onClick={() => setIsCartOpen(true)}>
            🛍️
            {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
          </button>

          {isLoggedIn ? (
            <div className="user-menu-container">
              {/* Profile Pill Button */}
              <button 
                className="user-profile-pill" 
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {/* Render photo if it exists, otherwise fallback to initials */}
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="user-avatar-img" />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                <span className="chevron-icon">⌄</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="user-dropdown">
                  {profilePhoto && (
                    <div className="dropdown-profile-pic">
                      <img src={profilePhoto} alt="User Profile" />
                    </div>
                  )}
                  
                  {/* "My Orders" Button */}
                  <button 
                    className="dropdown-menu-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/orders');
                    }}>
                    My Orders
                  </button>

                  {/* Log Out Button */}
                  <button 
                    className="dropdown-menu-btn logout-btn" 
                    onClick={handleLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="secondary" onClick={() => navigate("/login")}>Log In</Button>
              <Button variant="primary" onClick={() => navigate("/signup")}>Sign Up</Button>
            </>
          )}

          {/* Theme Toggle Button */}
          <button className="icon-circle-btn" onClick={toggleTheme}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={(fullAddress) => { setAddress(fullAddress); }}
      />

      {/* Cart Sidebar rendered at the root level */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default TopPanel;