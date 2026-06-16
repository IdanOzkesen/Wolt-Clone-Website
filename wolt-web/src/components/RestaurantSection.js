import React, { useState, useEffect } from 'react';
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

  const restaurantLogo = restaurant.image || defaultPlaceholder;

  return (
    <div className="restaurant-section-row">
      {/* Restaurant Header Information */}
      <div className="restaurant-row-header">
        <div className="restaurant-meta-right">
          <img src={restaurantLogo} alt={restaurant.name} className="res-row-logo" />
          <div className="res-text-details">
            <h2>{restaurant.name}</h2>
            <p className="res-sub-meta">
              📍 {restaurant.address} • 📞 {restaurant.phoneNum} • ⏱️ {distance ? `${distance} km away` : 'Nearby'}
            </p>
          </div>
        </div>
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
            <ProductCard key={product.id} product={product} variant={""} />
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