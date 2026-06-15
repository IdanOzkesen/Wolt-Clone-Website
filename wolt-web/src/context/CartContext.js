import React, { createContext, useState, useContext } from 'react';

// Create the Context
export const CartContext = createContext();

// Create a custom hook for easy access
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // State holds the current restaurant ID and the list of items
  const [cart, setCart] = useState({
    restaurantId: null,
    restaurantName: "",
    items: [] // Array of { productId, name, price, quantity }
  });

  // Calculate the total price derived from the cart state
  const totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  // Calculate total amount of items for the badge icon
  const totalItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product, restaurant) => {
    setCart((prevCart) => {
      // RULE: Check if attempting to add from a different restaurant
      if (prevCart.restaurantId && prevCart.restaurantId !== restaurant.id) {
        alert("You can only order from one restaurant at a time. Please clear your cart first.");
        return prevCart; // Return unchanged state
      }

      const existingItemIndex = prevCart.items.findIndex(item => item.productId === product.id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        // Product exists, increment quantity
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex].quantity += 1;
      } else {
        // New product, add to array
        updatedItems = [
          ...prevCart.items,
          { 
            productId: product.id, 
            name: product.name, 
            price: product.price, 
            quantity: 1 
          }
        ];
      }

      return {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: updatedItems
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(item => item.productId === productId);
      if (existingItemIndex === -1) return prevCart;

      let updatedItems = [...prevCart.items];
      
      if (updatedItems[existingItemIndex].quantity > 1) {
        // Decrease quantity if more than 1
        updatedItems[existingItemIndex].quantity -= 1;
      } else {
        // Remove item completely if quantity is 1
        updatedItems.splice(existingItemIndex, 1);
      }

      // If cart is empty after removal, reset the restaurant context
      if (updatedItems.length === 0) {
        return { restaurantId: null, restaurantName: "", items: [] };
      }

      return { ...prevCart, items: updatedItems };
    });
  };

  const clearCart = () => {
    setCart({ restaurantId: null, restaurantName: "", items: [] });
  };

  // The value object exposes the state and functions to the rest of the app
  const value = {
    cart,
    totalPrice,
    totalItemsCount,
    addToCart,
    removeFromCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};