import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandPage.css";

const LandPage = () => {
  const navigate = useNavigate();

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
            />

            <button className="search-btn">
              Search
            </button>
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
    </div>
  );
};

export default LandPage;