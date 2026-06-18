import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './OrdersPage.css';
import { apiFetch } from '../services/api';
const deliverPrice = 10

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  const { userData, isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    const fetchOrdersAndProducts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // 1. Fetch the raw orders
        const ordersResponse = await apiFetch(`/users/${userData.userId}/orders`, {
          method: 'GET',
        });

        if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
        let ordersData = await ordersResponse.json();

        // Sort by newest first
        ordersData = ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 2. Extract unique products AND unique restaurants
        const productsToFetch = [];
        const uniqueRestaurants = new Set();

        ordersData.forEach(order => {
          const restId = order.restaurantId || order.restaurant; 
          
          if (restId) {
            uniqueRestaurants.add(restId);
            if (order.products && Array.isArray(order.products)) {
              order.products.forEach(id => {
                if (!productsToFetch.some(p => p.productId === id)) {
                  productsToFetch.push({ productId: id, restaurantId: restId });
                }
              });
            }
          }
        });

        // 3. Fetch details for products AND restaurants simultaneously
        const productPromises = productsToFetch.map(({ productId, restaurantId }) => 
          apiFetch(`/restaurants/${restaurantId}/products/${productId}`, {
            method: 'GET',
            headers: { 
              'userId': userData.userId 
            } 
          })
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );

        const restaurantPromises = Array.from(uniqueRestaurants).map(restId => 
          apiFetch(`/restaurants/${restId}`, {
            method: 'GET'
          })
            .then(res => res.ok ? res.json() : null)
            .catch(() => null)
        );
        
        const [productsData, restaurantsData] = await Promise.all([
          Promise.all(productPromises),
          Promise.all(restaurantPromises)
        ]);

        // 4. Create dictionaries for fast lookups
        const productMap = {};
        productsData.forEach(product => {
          if (product && (product._id || product.id)) {
            productMap[product._id || product.id] = product;
          }
        });

        const restaurantMap = {};
        restaurantsData.forEach(rest => {
          if (rest && (rest._id || rest.id)) {
            restaurantMap[rest._id || rest.id] = rest.name || "Unknown Restaurant";
          }
        });

        // 5. Enrich the orders with product data AND restaurant names
        const enrichedOrders = ordersData.map(order => {
          const restId = order.restaurantId || order.restaurant;
          const resolvedRestaurantName = order.restaurantName || restaurantMap[restId] || 'Unknown Restaurant';

          const populatedProducts = order.products.map(id => {
            return productMap[id] || { _id: id, name: `Unknown Item (${id.substring(0,6)})`, price: 0 };
          });

          const totalPrice = populatedProducts.reduce((sum, p) => sum + (p.price || 0), 0) + deliverPrice;

          return {
            ...order,
            restaurantName: resolvedRestaurantName,
            products: populatedProducts,
            calculatedTotal: totalPrice
          };
        });

        setOrders(enrichedOrders);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Could not load your order history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (userData?.userId) {
      fetchOrdersAndProducts();
    }
  }, [isLoggedIn, userData, navigate]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const renderOrderItems = (products) => {
    if (!products || products.length === 0) {
      return <li className="expanded-empty">No items details available</li>;
    }

    const counts = {};
    products.forEach(p => {
      const id = p._id || p.id;
      if (!counts[id]) counts[id] = { ...p, qty: 0 };
      counts[id].qty += 1;
    });

    return Object.values(counts).map(item => (
      <li key={item._id || item.id} className="expanded-item-row">
        <span className="expanded-item-qty">{item.qty}x</span>
        <span className="expanded-item-name">{item.name}</span>
        {item.price > 0 && <span className="expanded-item-price">₪{(item.price * item.qty).toFixed(2)}</span>}
      </li>
    ));
  };

  if (loading) {
    return (
      <div className="orders-page-container flex-center">
        <div className="loader">Loading your cravings...</div>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Your past deliveries and cravings</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!error && orders.length === 0 ? (
        <div className="empty-orders">
          <span className="empty-icon">🍽️</span>
          <h2>No orders yet</h2>
          <p>You haven't placed any orders. Time to explore some restaurants!</p>
          <button className="start-exploring-btn" onClick={() => navigate('/discovery')}>
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const currentOrderId = order._id || order.id;
            const isExpanded = expandedOrderId === currentOrderId;

            return (
              <div key={currentOrderId} className={`order-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="order-card-header">
                  <span className="order-id">
                    Order #{String(currentOrderId).substring(0, 8).toUpperCase()}
                  </span>
                  <span className="order-date">
                    {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="order-card-body">
                  {/* NEW ROW: Restaurant Name */}
                  <div className="order-detail-row">
                    <span className="detail-label">Restaurant:</span>
                    <span className="detail-value" style={{ fontWeight: '600' }}>
                      {order.restaurantName}
                    </span>
                  </div>
                  
                  <div className="order-detail-row">
                    <span className="detail-label">Delivery to:</span>
                    <span className="detail-value">{order.deliveryAddress || 'N/A'}</span>
                  </div>
                  
                  <div className="order-detail-row">
                    <span className="detail-label">Items count:</span>
                    <span className="detail-value">
                      {order.products ? order.products.length : '0'} items
                    </span>
                  </div>
                  
                  <div className="order-detail-row">
                    <span className="detail-label">Total Price:</span>
                    <span className="detail-value" style={{ fontWeight: 'bold', color: '#009de0' }}>
                      ₪{order.calculatedTotal > 0 ? order.calculatedTotal.toFixed(2) : '---'}
                    </span>
                  </div>
                </div>

                <button 
                  className="toggle-details-btn" 
                  onClick={() => toggleOrderDetails(currentOrderId)}
                >
                  {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                </button>

                {isExpanded && (
                  <div className="order-expanded-content">
                    <h4 className="expanded-title">Order Items:</h4>
                    <ul className="expanded-items-list">
                      {renderOrderItems(order.products)}
                    
                      <li className="expanded-item-row" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #ccc' }}>
                        <span className="expanded-item-qty"></span>
                        <span className="expanded-item-name">🛵 Delivery Fee</span>
                        <span className="expanded-item-price">₪{deliverPrice.toFixed(2)}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrdersPage;