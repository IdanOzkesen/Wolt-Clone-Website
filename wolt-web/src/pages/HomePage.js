import React, { useState, useEffect, useContext } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import CategorySlider from "../components/CategorySlider";
import RestaurantSection from "../components/RestaurantSection";
import { apiFetch } from '../services/api';
import Button from "../components/Buttons";
import { AuthContext } from "../context/AuthContext";



function HomePage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Track the active category filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn, userData } = useContext(AuthContext);
  const [myRestaurants, setMyRestaurants] = useState([]);

  const handleAddRestaurant = async () => {
    navigate('/AddRestaurantPage');
  };

  useEffect(() => {
    const loadRestaurantsData = async () => {
      try {
        setLoading(true);
        
        const allResResponse = await apiFetch("/restaurants");
        const allData = await allResResponse.json();

        let myData = [];
        if (isLoggedIn && userData) {
          const userId = userData.userId; 
          const myResResponse = await apiFetch(`/restaurants/owner/${userId}`);
          
          if (myResResponse.ok) {
            myData = await myResResponse.json();
          }
        }

        const processedData = (allData || []).map((res, index) => ({
          ...res,
          computedDistance: parseFloat((((index * 7) % 45) / 10 + 0.5).toFixed(1))
        }));

        setRestaurants(processedData);
        setMyRestaurants(myData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantsData();
  }, [isLoggedIn, userData]);

  if (loading) return <div className="wolt-loading">Loading delicious content...</div>;
  if (error) return <div className="wolt-error">{error}</div>;

  // Step 1: Filter the master list dynamically by the selected category (if one is active)
  const filteredRestaurants = selectedCategory
    ? restaurants.filter(res => res.category === selectedCategory)
    : restaurants;

  // Step 2: Split the ALREADY filtered data based ONLY on distance criteria
  const nearbyRestaurants = filteredRestaurants.filter(res => res.computedDistance <= 2.0);
  const furtherRestaurants = filteredRestaurants.filter(res => res.computedDistance > 2.0);

  return (
    <div className="discovery-page-container">

      <div className="add-restaurant-bar">
        <Button variant="primary" onClick={handleAddRestaurant}>
          + Add New Restaurant
        </Button>
      </div>

      {/* Top horizontal circular categories slider with sync state */}
      <CategorySlider
        restaurants={restaurants}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="sections-list">

        {myRestaurants.length > 0 && (
          <div className="dashboard-group">
            <h1 className="group-main-title">My Restaurants 👨‍🍳</h1>
            {myRestaurants.map(res => (
              <RestaurantSection key={res.id} restaurant={res} />
            ))}
          </div>
        )}

        {/* If the filter yields no results */}
        {filteredRestaurants.length === 0 && (
          <div className="empty-state-centered">
            <span className="empty-icon">🍽️</span>
            <h3>No restaurants found</h3>
            <p>No restaurants found matching "{selectedCategory}" in your area.</p>
          </div>
        )}

        {/* Section 1: Popular Nearby (Distance <= 2.0 km) */}
        {nearbyRestaurants.length > 0 && (
          <div className="dashboard-group">
            <h1 className="group-main-title">Popular Nearby (Under 2 km) 🛵</h1>
            {nearbyRestaurants.map(res => (
              <RestaurantSection
                key={res.id}
                restaurant={res}
                distance={res.computedDistance}
              />
            ))}
          </div>
        )}

        {/* Section 2: Further Restaurants in the Area (Distance > 2.0 km) */}
        {furtherRestaurants.length > 0 && (
          <div className="dashboard-group">
            <h1 className="group-main-title">All Restaurants in Your Area 📍</h1>
            {furtherRestaurants.map(res => (
              <RestaurantSection
                key={res.id}
                restaurant={res}
                distance={res.computedDistance}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default HomePage;