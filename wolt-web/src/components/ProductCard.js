import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import defaultPlaceholder from '../assets/default-placeholder.jpg';

function ProductCard({ product, onClick, variant = 'default' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const productImage = product.image || defaultPlaceholder;

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

      {/* המודל ירונדר רק אם הוא פתוח ואנחנו לא במצב 'מסעדה' */}
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
              
              {/* החלק של המסעדה בתחתית המודל שמפנה לעמוד המסעדה */}
              {/* הנחתי שיש לך product.restaurantId ו-product.restaurantName */}
              <div className="modal-restaurant-link-wrapper">
                <Link to={`/restaurants/${product.restaurantId}`} className="modal-restaurant-link">
                  <div className="restaurant-link-info">
                    <span className="restaurant-name">{product.restaurantName || "Go to Restaurant"}</span>
                    {/* אפשר לשים פה גם ציון או זמן משלוח אם יש לך ב-API */}
                  </div>
                  <span className="restaurant-link-arrow">›</span>
                </Link>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ProductCard;