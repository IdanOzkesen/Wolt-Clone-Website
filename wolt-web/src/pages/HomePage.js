import React, { useState, useEffect } from "react";
import "./HomePage.css";
import { Link, useNavigate } from "react-router-dom";
import CategorySlider from "../components/CategorySlider";
import RestaurantSection from "../components/RestaurantSection";
import { apiFetch } from '../services/api';
import Button from "../components/Buttons";


function HomePage() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Track the active category filter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleAddRestaurant = async () => {
    navigate('/AddRestaurantPage');
  };

  useEffect(() => {
    const loadRestaurantsData = async () => {
      try {
        const response = await apiFetch("/restaurants");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        // Data Processing: Inject mock distances to enable filtering by distance
        const processedData = (data || []).map((res, index) => {
          const mockDistance = parseFloat((((index * 7) % 45) / 10 + 0.5).toFixed(1));
          return {
            ...res,
            computedDistance: mockDistance
          };
        });

        setRestaurants(processedData);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Unable to load restaurants from the server.");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantsData();
  }, []);

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

      <div style={{ padding: '20px 20px 0 20px' }}>
        <Button variant="primary" onClick={handleAddRestaurant}>
          Add New Restaurant
        </Button>
        </div>

      {/* Top horizontal circular categories slider with sync state */}
      <CategorySlider
        restaurants={restaurants}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="sections-list">

        {/* If the filter yields no results */}
        {filteredRestaurants.length === 0 && (
          <div className="no-results-placeholder">
            <p>No restaurants found matching "{selectedCategory}" in your area.</p>
          </div>
        )}

        {/* Section 1: Popular Nearby (Distance <= 2.0 km) */}
        {nearbyRestaurants.length > 0 && (
          <div className="dashboard-group">
            <h1 className="group-main-title">Popular Nearby (Under 2 km) 🛵</h1>
            {nearbyRestaurants.map(res => (
              <Link to={`/restaurant/${res.id}`} key={res.id} className="restaurant-card-link">
                <RestaurantSection
                  restaurant={res}
                  distance={res.computedDistance}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Section 2: Further Restaurants in the Area (Distance > 2.0 km) */}
        {furtherRestaurants.length > 0 && (
          <div className="dashboard-group">
            <h1 className="group-main-title">All Restaurants in Your Area 📍</h1>
            {furtherRestaurants.map(res => (
              <Link to={`/restaurant/${res.id}`} key={res.id} className="restaurant-card-link">
                <RestaurantSection
                  restaurant={res}
                  distance={res.computedDistance}
                />
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default HomePage;