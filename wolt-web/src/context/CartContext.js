import React, { createContext, useState, useContext } from 'react';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    restaurantId: null,
    restaurantName: "",
    items: [] 
  });

  const totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (product, restaurant) => {
    if (cart.restaurantId && cart.restaurantId !== restaurant.id) {
      alert("You can only order from one restaurant at a time. Please clear your cart first.");
      return;
    }
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(item => item.productId === product.id);
      
      let updatedItems = [...prevCart.items]; // Copy the array

      if (existingItemIndex >= 0) {
        // FIXED: Create a brand new object for the updated item instead of mutating the old one
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
      } else {
        updatedItems.push({ 
          productId: product.id, 
          name: product.name, 
          price: product.price, 
          quantity: 1 
        });
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
        // FIXED: Create a brand new object when decreasing quantity
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity - 1
        };
      } else {
        updatedItems.splice(existingItemIndex, 1);
      }

      if (updatedItems.length === 0) {
        return { restaurantId: null, restaurantName: "", items: [] };
      }

      return { ...prevCart, items: updatedItems };
    });
  };

  // Function to completely clear the cart after a successful order
  const clearCart = () => {
    setCart({
      restaurantId: null,
      restaurantName: '',
      items: []
    });
  };

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