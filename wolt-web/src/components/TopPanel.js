import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AddressModal from "./AddressModal";
import Button from "./Buttons";
import "./TopPanel.css";
import woltLogo from "../assets/logo.png";
import { useCart } from '../context/CartContext'; 
import CartSidebar from './CartSidebar';
import { apiFetch } from '../services/api';

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
  const [searchQuery, setSearchQuery] = useState("");

  // State to hold the full user profile fetched from the database
  const [fetchedUser, setFetchedUser] = useState(null);

  useEffect(() => {
    const fetchFullUserProfile = async () => {
      // Only execute if the user is authenticated and we have their ID
      if (isLoggedIn && userData?.userId) {
        try {
          // Use the custom apiFetch (No need to pass headers/tokens, it does it automatically!)
          const response = await apiFetch(`/users/${userData.userId}`, { method: 'GET' });
          
          if (response.ok) {
            const data = await response.json();
            setFetchedUser(data); // Save the fetched data to state
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchFullUserProfile();
  }, [isLoggedIn, userData?.userId]); // Re-run if login status or user ID changes

  // ==========================================
  // EXISTING LOGIC (Dark Mode, Logo Routing, etc.)
  // ==========================================
  
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); 
    }
  };

  useEffect(() => {
    const storedAddress = localStorage.getItem('address');
    if (storedAddress) {
      setAddress(storedAddress);
    }
  }, [location.pathname]);

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark'; 
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark'); 
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light'); 
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const handleLogoClick = () => {
    if (!isLoggedIn) {
      navigate('/'); 
      return; 
    } 
    if (location.pathname === '/discovery') {
      navigate('/'); 
    } else {
      navigate('/discovery');
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/');
  };

  // ==========================================
  // DYNAMIC UI VARIABLES
  // ==========================================
  // Prioritize the fetched user data, fallback to context data if not yet loaded
  const displayName = fetchedUser?.name || userData?.userDisplayName || "";
  
  // Check common image field names (photo, imageUrl, profilePhoto) from your backend schema
  const profilePhoto = fetchedUser?.photo || fetchedUser?.imageUrl || userData?.profilePhoto || ""; 
  
  const displayAddress = fetchedUser?.address || userData?.address || address || "Set Address";
  const isLandPage = location.pathname === "/";

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

        {/* MIDDLE SECTION: Search Bar */}
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

        {/* RIGHT SECTION: Actions */}
        <div className="top-panel-actions">
          
          <button className="icon-circle-btn" onClick={() => setIsCartOpen(true)}>
            🛍️
            {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
          </button>

          {isLoggedIn ? (
            <div className="user-menu-container">
              <button 
                className="user-profile-pill" 
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="user-avatar-img" />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
                {/* Displaying the user's name next to the avatar dynamically */}
                <span className="user-first-name" style={{ marginLeft: '8px', fontWeight: 'bold' }}>
                  {displayName.split(" ")[0]}
                </span>
                <span className="chevron-icon">⌄</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  {profilePhoto && (
                    <div className="dropdown-profile-pic">
                      <img src={profilePhoto} alt="User Profile" />
                    </div>
                  )}
                  
                  <button 
                    className="dropdown-menu-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile'); 
                    }}>
                    My Profile
                  </button>

                  <button 
                    className="dropdown-menu-btn"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/orders');
                    }}>
                    My Orders
                  </button>

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

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default TopPanel;