import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import './RestaurantSection.css';
import { apiFetch } from '../services/api';
import defaultPlaceholder from '../assets/default-placeholder.jpg';


function RestaurantSection({ restaurant, distance }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch specific products for this restaurant using its ID
  useEffect(() => {
    const fetchRestaurantProducts = async () => {
      try {
        const response = await apiFetch(`/restaurants/${restaurant.id}/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data || []);
      } catch (err) {
        console.error(`Error loading products for restaurant ${restaurant.id}:`, err);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (restaurant.id) {
      fetchRestaurantProducts();
    }
  }, [restaurant.id]);

  const restaurantLogo = restaurant.imageUrl || defaultPlaceholder;

  return (
    <div className="restaurant-section-row">
      {/* Restaurant Header Information (clicking the details opens the restaurant page) */}
      <div className="restaurant-row-header">
        <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card-link">
          <div className="restaurant-meta-right">
            <img src={restaurantLogo} alt={restaurant.name} className="res-row-logo" />
            <div className="res-text-details">
              <h2>{restaurant.name}</h2>
              <p className="res-sub-meta">
                📍 {restaurant.address} • 📞 {restaurant.phoneNum} • ⏱️ {distance ? `${distance} km away` : 'Nearby'}
              </p>
            </div>
          </div>
        </Link>
        <div className="slider-arrows">
          <button className="arrow-btn">⮕</button>
          <button className="arrow-btn">⬅</button>
        </div>
      </div>

      {/* Horizontal List of Products */}
      <div className="products-horizontal-list">
        {loadingProducts ? (
          <div className="products-small-loading">Loading menu...</div>
        ) : products.length > 0 ? (
          products.map(product => (
            // Enrich the product with its restaurant details so the popup can link back to it
            <ProductCard
              key={product.id}
              product={{ ...product, restaurantId: restaurant.id, restaurantName: restaurant.name }}
              variant={""}
            />
          ))
        ) : (
          <div className="no-products-placeholder">
            <p>No items available in the menu right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantSection;