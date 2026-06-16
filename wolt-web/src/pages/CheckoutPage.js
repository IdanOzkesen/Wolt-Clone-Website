import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './CheckoutPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { userData, isLoggedIn } = useContext(AuthContext);
  console.log("My User Data:", userData);

  // Form State
  const [orderDetails, setOrderDetails] = useState({
    fullName: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (isLoggedIn && userData) {
      setOrderDetails(prev => ({
        ...prev,
        fullName: userData.userDisplayName || '',
        phone: userData.phoneNum || '',
        address: userData.address || localStorage.getItem('address') || ''
      }));
    } else {
      // Fallback for guest (from address modal)
      setOrderDetails(prev => ({
        ...prev,
        address: localStorage.getItem('address') || ''
      }));
    }
  }, [isLoggedIn, userData]);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  };

  // Prevent submitting empty orders (AAA-140 validation)
  const isFormValid = orderDetails.fullName && orderDetails.phone && orderDetails.address;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // 1. Check if the user is NOT logged in
    if (!isLoggedIn) {
      alert("You must be logged in to complete your order. Redirecting to login...");
      navigate('/login', { state: { from: '/checkout' } });
      return; 
    }
    
    // 2. Validate form fields
    if (!isFormValid) return;
    
    try {
      // 3. Prepare the Payload
      // Flatten the cart items based on quantity (e.g., qty: 2 means the ID appears twice)
      const productIds = [];
      cart.items.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
          productIds.push(item.productId);
        }
      });

      const orderPayload = {
        userId: userData.id, // Taken directly from AuthContext
        restaurantId: cart.restaurantId,
        products: productIds,
        deliveryAddress: orderDetails.address
      };

      // 4. Retrieve the JWT token from local storage
      const token = localStorage.getItem('accessToken');

      // 5. Send the POST request to the backend (AAA-141)
      const response = await fetch(`http://localhost:10000/api/users/${userData.id}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // JWT attached to headers as required
        },
        body: JSON.stringify(orderPayload)
      });

      // 6. Handle the Server Response
      if (response.status === 201 || response.ok) {
        alert("🎉 Order placed successfully! Your food is on the way.");
        
        // Clear the cart context
        clearCart();
        
        // Redirect the user back to the discovery/home page
        navigate('/discovery'); 
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to place order: ${errorData.message || 'Unknown error occurred'}`);
      }

    } catch (error) {
      console.error("Error submitting order:", error);
      alert("❌ A network error occurred while placing your order. Please check if the server is running.");
    }
  };

  // If cart is empty, don't show the checkout form
  if (cart.items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your order yet.</p>
        <button onClick={() => navigate('/')} className="back-to-home-btn">Go get some food!</button>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your order from <strong>{cart.restaurantName}</strong></p>
      </div>

      <div className="checkout-content-grid">
        
        {/* LEFT COLUMN: Delivery Details Form */}
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h2>Delivery Details</h2>
            <form onSubmit={handleSubmitOrder} className="delivery-form">
              
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={orderDetails.fullName} 
                  onChange={handleChange} 
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={orderDetails.phone} 
                  onChange={handleChange} 
                  placeholder="e.g. 050-1234567"
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={orderDetails.address} 
                  onChange={handleChange} 
                  placeholder="Street, Building, Apartment..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Notes (Optional)</label>
                <input 
                  type="text"
                  name="notes" 
                  value={orderDetails.notes} 
                  onChange={handleChange} 
                  placeholder="e.g. Leave at the door, call upon arrival..."
                  rows="3"
                />
              </div>

            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="checkout-summary-section">
          <div className="checkout-card summary-card">
            <h2>Order Summary</h2>
            
            <ul className="summary-items-list">
              {cart.items.map(item => (
                <li key={item.productId} className="summary-item">
                  <span className="summary-qty">{item.quantity}x</span>
                  <span className="summary-name">{item.name}</span>
                  <span className="summary-price">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>$2.50</span> {/* Hardcoded delivery fee for UI sake */}
            </div>
            
            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span>${(totalPrice + 2.50).toFixed(2)}</span>
            </div>

            <button 
              type="button" 
              className="place-order-btn" 
              disabled={!isFormValid}
              onClick={handleSubmitOrder}
            >
              Place Order
            </button>
            {!isFormValid && <p className="validation-msg">Please fill all required details.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;