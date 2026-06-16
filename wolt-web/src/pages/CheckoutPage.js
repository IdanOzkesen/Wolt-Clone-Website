import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './CheckoutPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice } = useCart();
  const { userData, isLoggedIn } = useContext(AuthContext);

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

  const handleSubmitOrder = (e) => {
    e.preventDefault();

    // 1. Check if the user is NOT logged in
    if (!isLoggedIn) {

      // 2. Redirect to login and pass the current path in the state
      navigate('/login', { state: { from: '/checkout' } });
      return; // Stop the execution here
    }
    
    // 3. Existing validation check
    if (!isFormValid) return;
    
    // Future Task: AAA-141 (Send POST Request)
    console.log("Submitting Order to Server:", { 
      restaurantId: cart.restaurantId,
      items: cart.items,
      customer: orderDetails,
      total: totalPrice
    });
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