import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import './RestaurantView.css';

function RestaurantView() {
  // Extract the dynamic :id parameter from the current URL path
  const { id } = useParams();

  // State Management
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useRef Hook initialization
  // Used here to reference the products container element for smooth programmatic scrolling
  const menuSectionRef = useRef(null);

  // Fetch target restaurant and its associated products on mount or when ID updates
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      try {
        // 1. Fetch main restaurant meta-data
        const resDetails = await fetch(`http://localhost:10000/api/restaurants/${id}`);
        if (!resDetails.ok) throw new Error('Restaurant not found');
        const restaurantData = await resDetails.json();
        setRestaurant(restaurantData);

        // 2. Fetch specific products/menu for this restaurant
        const resProducts = await fetch(`http://localhost:10000/api/restaurants/${id}/products`);
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

  // Handler utilizing useRef for smooth DOM manipulation layout control
  const scrollToMenu = () => {
    if (menuSectionRef.current) {
      menuSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) return <div className="wolt-loading-screen">Loading restaurant blueprint...</div>;
  if (error) return <div className="wolt-error-screen">⚠️ Error: {error}. <Link to="/">Go Back Home</Link></div>;
  if (!restaurant) return null;

  return (
    <div className="restaurant-view-page">
      {/* Hero Banner Section */}
      <header className="restaurant-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="restaurant-tag">{restaurant.category || "Fast Food"}</span>
            <h1 className="restaurant-view-name">{restaurant.name}</h1>
            <p className="restaurant-view-meta">📍 {restaurant.address} • 📞 {restaurant.phoneNum}</p>
            
            {/* Trigger scroll animation via useRef link */}
            <button className="jump-to-menu-btn" onClick={scrollToMenu}>
              View Full Menu 👇
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="restaurant-view-body">
        
        {/* Menu Target Anchored with useRef container */}
        <section className="menu-products-section" ref={menuSectionRef}>
          <h2 className="section-menu-title">Popular Items</h2>
          
          {products.length === 0 ? (
            <p className="no-products-msg">No products have been added to this kitchen yet.</p>
          ) : (
            <div className="products-grid-layout">
              {products.map((product) => (
                <div key={product.id} className="product-item-card">
                  <div className="product-card-details">
                    <h3>{product.name}</h3>
                    <p className="product-desc">{product.description || "No description provided."}</p>
                    <span className="product-price">₪{product.price}</span>
                  </div>
                  <button className="add-to-cart-action-btn">+</button>
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