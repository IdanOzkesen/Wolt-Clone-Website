import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import './ProductCard.css';
import defaultPlaceholder from '../assets/default-placeholder.jpg';

function ProductCard({ product, onClick, variant = 'default' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Prefer the image saved on the server; fall back to the placeholder only when none exists
  const productImage = product.imageUrl || product.image || defaultPlaceholder;
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (variant === 'restaurant') {
      if (onClick) onClick();
    } else {
      setIsModalOpen(true);
    }
  };

  const closeModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  // Moves the user forward to the next step (the dedicated screen is built later).
  // For now it just navigates to a separate page on click.
  const handleNext = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
    navigate(`/restaurant/${product.restaurantId}`, {
      state: { openProductId: product.id }
    });
  };

  return (
    <>
      <div className={`product-card ${variant}`} onClick={handleCardClick}>
        <div className="product-image-wrapper">
          <img src={productImage} alt={product.name} />
          <span className="product-price-badge">ILS {Number(product.price).toFixed(2)}</span>

          {variant === 'restaurant' && (
            <button className="add-to-cart-action-btn">+</button>
          )}
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>
          {product.description && <p>{product.description}</p>}
        </div>
      </div>

      {isModalOpen && variant !== 'restaurant' && createPortal(
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>

            <button className="modal-close-btn" onClick={closeModal} aria-label="Close">✕</button>

            <div className="modal-hero-img-wrap">
              <img src={productImage} alt={product.name} className="modal-hero-img" />
            </div>

            <div className="modal-body">
              <h2 className="modal-product-name">{product.name}</h2>
              <p className="modal-product-price">ILS {Number(product.price).toFixed(2)}</p>
              <p className="modal-product-desc">
                {product.description || "No description available."}
              </p>

              <div className="modal-restaurant-link-wrapper">
                <Link to={`/restaurant/${product.restaurantId}`} className="modal-restaurant-link">
                  <div className="restaurant-link-info">
                    <span className="restaurant-name">{product.restaurantName || "Go to Restaurant"}</span>
                  </div>
                  <span className="restaurant-link-arrow">›</span>
                </Link>
              </div>

              <button className="modal-next-btn" onClick={handleNext}>
                Next
              </button>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ProductCard;