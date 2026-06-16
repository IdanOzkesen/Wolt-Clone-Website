import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, totalPrice, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();

  // If the sidebar is not toggled open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        
        <div className="cart-header">
          <h2>Your Order</h2>
          <button className="close-cart-btn" onClick={onClose}>×</button>
        </div>

        <div className="cart-body">
          {cart.items.length === 0 ? (
            <div className="empty-cart-msg">
              <span role="img" aria-label="sad-cart">🛒</span>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <p className="cart-restaurant-name">Ordering from: <strong>{cart.restaurantName}</strong></p>
              <ul className="cart-items-list">
                {cart.items.map((item) => (
                  <li key={item.productId} className="cart-item-row">
                    
                    <div className="cart-item-details">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <div className="cart-item-controls">
                      <button className="qty-btn" onClick={() => removeFromCart(item.productId)}>-</button>
                      <span className="qty-display">{item.quantity}</span>
                      <button 
                        className="qty-btn" 
                        onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price }, { id: cart.restaurantId, name: cart.restaurantName })}
                      >
                        +
                      </button>
                    </div>

                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <span>Total:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button 
            className="go-to-checkout-btn" 
            disabled={cart.items.length === 0}
            onClick={() => {
              onClose(); 
              navigate('/checkout'); 
            }}
          >
            Go to checkout
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartSidebar;