import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import './RestaurantView.css';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext'; // 1. Imported the cart context
import defaultPlaceholder from '../assets/default-placeholder.jpg';
import { AuthContext } from '../context/AuthContext';

function RestaurantView() {
  const { id } = useParams();
  const { userData, isLoggedIn } = useContext(AuthContext);
  // 2. Destructure the addToCart function from our global state
  const { addToCart } = useCart();

  // State Management
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuSectionRef = useRef(null);

  // 3. Ownership Check: Ensure types match by converting both to String
  const isOwner = isLoggedIn && userData && restaurant &&
    String(userData.userId) === String(restaurant.ownerId);

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
        // 4. Log error to console for debugging
        console.error("Error loading restaurant data:", err);
        setError(err.message || 'Failed to sync with server.');
      } finally {
        setLoading(false);
      }
    };


    fetchRestaurantDetails();
  }, [id]);
  const handleDeleteRestaurant = async () => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      const res = await apiFetch(`/restaurants/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': userData.userId
        }
      });
      if (res.ok) window.location.href = "/";
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const res = await apiFetch(`/restaurants/${id}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': userData.userId
        }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    }
  };

  if (loading) return <div className="wolt-loading-screen">Loading menu...</div>;
  if (error) return <div className="wolt-error-screen">⚠️ Error: {error}. <Link to="/">Back to Home</Link></div>;
  if (!restaurant) return null;

  return (
    <div className="restaurant-view-page">
      <header className="restaurant-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            {/* 5. Display edit button for restaurant if the current user is the owner */}
            <h1 className="restaurant-view-name">
              {restaurant.name}
              {isOwner && (
                <>
                  <button className="edit-pencil-btn" aria-label="Edit">✏️</button>
                  <button className="delete-btn" onClick={handleDeleteRestaurant} aria-label="Delete">🗑️</button>
                </>
              )}
            </h1>
            <p className="restaurant-view-meta">📍 {restaurant.address} • 📞 {restaurant.phoneNum}</p>
          </div>
        </div>
      </header>

      <main className="restaurant-view-body">
        <section className="menu-products-section" ref={menuSectionRef}>
          <div className="menu-header-row">
            <h2 className="section-menu-title">Popular Items</h2>
            {/* 6. Add product button visible only to the restaurant owner */}
            {isOwner && <button className="add-product-btn">+ Add Product</button>}
          </div>

          {products.length === 0 ? (
            <p className="no-products-msg">No items found in this restaurant's menu.</p>
          ) : (
            <div className="products-grid-layout">
              {products.map((product) => (
                <div key={product.id} className="product-item-card">
                  <div className="product-card-details">
                    <h3 className="product-title-text">
                      {product.name}
                      {isOwner && (
                        <>
                          <span className="product-edit-icon" aria-label="Edit">✏️</span>
                          <span className="product-delete-icon" onClick={() => handleDeleteProduct(product.id)} aria-label="Delete">🗑️</span>
                        </>
                      )}
                    </h3>
                    <p className="product-desc-text">{product.description}</p>
                    <span className="product-price-text">₪{parseFloat(product.price).toFixed(2)}</span>
                  </div>

                  <div className="product-image-block">
                    {/* 8. Connected the button to the real addToCart function */}
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