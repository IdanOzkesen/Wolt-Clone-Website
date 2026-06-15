import React, { useState, useEffect } from "react";
import "./HomePage.css";
import CategorySlider from "../components/CategorySlider";
import RestaurantSection from "../components/RestaurantSection";
import { apiFetch } from '../services/api';


function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRestaurantsData = async () => {
      try {
        const response = await apiFetch("/restaurants");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        // Data Processing: Inject mock distances to enable filtering by distance
        const processedData = (data || []).map((res, index) => {
          // Generates a dynamic mock distance between 0.5 and 5.0 km based on index
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

  // Split and filter data dynamically based ONLY on distance criteria
  const nearbyRestaurants = restaurants.filter(res => res.computedDistance <= 2.0);
  const furtherRestaurants = restaurants.filter(res => res.computedDistance > 2.0);

  return (
    <div className="discovery-page-container">
      
      {/* Top horizontal circular categories slider */}
      <CategorySlider />

      <main className="sections-list">
        
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