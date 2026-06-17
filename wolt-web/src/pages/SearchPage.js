import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SearchPage.css';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // States for both restaurants and products
  const [restaurants, setRestaurants] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. Call your actual backend Search API
        // Make sure this URL matches your Express route exactly!
        const response = await fetch(`http://localhost:10000/api/search/${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results from the server');
        }
        
        const data = await response.json();
        
        // 2. Set the data returned from your server
        // Assuming your backend returns an object like: { restaurants: [...], products: [...] }
        setRestaurants(data.restaurants || []);
        setProducts(data.products || []);
        
      } catch (err) {
        console.error("Error searching via API:", err);
        setError("Something went wrong while searching. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      // Clear results if the search bar is empty
      setRestaurants([]);
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  // Loading state UI
  if (loading) {
    return <div className="search-page-container loader">Searching for "{query}"...</div>;
  }

  // Calculate total results to check if we have any match
  const totalResults = restaurants.length + products.length;

  return (
    <div className="search-page-container">
      <div className="search-header">
        <h1>Search Results</h1>
        <p>Showing results for: <strong>"{query}"</strong></p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Empty State when no results are found in either category */}
      {!error && totalResults === 0 ? (
        <div className="empty-state-centered">
          <span className="empty-icon">🔍</span>
          <h3>No matches found</h3>
          <p>We couldn't find any places or items matching "{query}".</p>
        </div>
      ) : (
        <div className="search-content-wrapper">
          
          {/* ========================================= */}
          {/* SECTION 1: RESTAURANTS (Places)           */}
          {/* ========================================= */}
          {restaurants.length > 0 && (
            <div className="search-section">
              <div className="section-header-flex">
                <h2>Places</h2>
                <span className="view-all-link">View all</span>
              </div>
              
              <div className="places-grid">
                {restaurants.map((rest) => (
                  <div 
                    key={rest._id || rest.id} 
                    className="place-card"
                    onClick={() => navigate(`/restaurant/${rest._id || rest.id}`)}
                  >
                    <div className="place-image-wrapper">
                      <img 
                        src={rest.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop'} 
                        alt={rest.name} 
                        className="place-img"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="place-info">
                      <h3>{rest.name}</h3>
                      <p className="place-tags">{rest.category || 'Restaurant'}</p>
                      <div className="place-meta">
                        <span>🛵 20-30 min</span>
                        <span> • </span>
                        <span>⭐ {rest.rating || 'New'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* SECTION 2: PRODUCTS (Related Items)       */}
          {/* ========================================= */}
          {products.length > 0 && (
            <div className="search-section">
              <div className="section-header-flex">
                <h2>Related Items</h2>
                <span className="view-all-link">View all</span>
              </div>
              
              <div className="items-grid">
                {products.map((product) => (
                  <div 
                    key={product._id || product.id} 
                    className="item-card"
                    // Navigates to the restaurant that owns this product
                    onClick={() => navigate(`/restaurant/${product.restaurantId || product.restaurant}`)}
                  >
                    <div className="item-info">
                      <div className="item-price">₪{product.price?.toFixed(2)}</div>
                      <h4 className="item-name">{product.name}</h4>
                      {/* Displays the restaurant name if your API populates it */}
                      <p className="item-restaurant-name">{product.restaurantName || 'Go to restaurant'}</p>
                    </div>
                    <div className="item-image-wrapper">
                      {/* Uses the ACTUAL product image from your DB */}
                      <img src={product.image} alt={product.name} className="item-img" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default SearchPage;