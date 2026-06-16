import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './RestaurantView.css';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext'; // 1. Imported the cart context
import defaultPlaceholder from '../assets/default-placeholder.jpg';

function RestaurantView() {
  const { id } = useParams();
  
  // 2. Destructure the addToCart function from our global state
  const { addToCart } = useCart(); 

  // State Management
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuSectionRef = useRef(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      try {
        const resDetails = await apiFetch(`/restaurants/${id}`);
        if (!resDetails.ok) throw new Error('Restaurant not found');
        const restaurantData = await resDetails.json();
        setRestaurant(restaurantData);

        const resProducts = await apiFetch(`/restaurants/${id}/products`);
        if (resProducts.ok) {
          const productsData = await resProducts.json();
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Error loading restaurant data:", err);
        setError(err.message || 'Failed to sync with server.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  if (loading) return <div className="wolt-loading-screen">Loading menu...</div>;
  if (error) return <div className="wolt-error-screen">⚠️ Error: {error}. <Link to="/">Back to Home</Link></div>;
  if (!restaurant) return null;

  return (
    <div className="restaurant-view-page">
      <header className="restaurant-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="restaurant-tag">{restaurant.category || "General"}</span>
            <h1 className="restaurant-view-name">{restaurant.name}</h1>
            <p className="restaurant-view-meta">📍 {restaurant.address} • 📞 {restaurant.phoneNum}</p>
          </div>
        </div>
      </header>

      <main className="restaurant-view-body">
        <section className="menu-products-section" ref={menuSectionRef}>
          <h2 className="section-menu-title">Popular Items</h2>
          
          {products.length === 0 ? (
            <p className="no-products-msg">No items found in this restaurant's menu.</p>
          ) : (
            <div className="products-grid-layout">
              {products.map((product) => (
                <div key={product.id} className="product-item-card">
                  
                  <div className="product-card-details">
                    <h3 className="product-title-text">
                      {product.name} {product.isSpicy && '🌶️'} {product.isVegan && '🌱'}
                    </h3>
                    <p className="product-desc-text">
                      {product.description || "No description available for this item."}
                    </p>
                    <span className="product-price-text">${parseFloat(product.price).toFixed(2)}</span>
                  </div>

                  <div className="product-image-block">
                    {/* 3. Connected the button to the real addToCart function */}
                    <button 
                      className="add-to-cart-action-btn"
                      onClick={() => addToCart(product, restaurant)}
                    >
                      +
                    </button>
                    <img 
                      src={product.image || defaultPlaceholder} 
                      alt={product.name} 
                      className="product-dish-img" 
                    />
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default RestaurantView;