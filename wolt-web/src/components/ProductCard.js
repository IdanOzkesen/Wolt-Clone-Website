import React from 'react';
import './ProductCard.css';
import defaultPlaceholder from '../assets/default-placeholder.jpg';

function ProductCard({ product }) {
  // Fallback placeholder image if no product image is provided yet
  const productImage = product.image || defaultPlaceholder;

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        <img src={productImage} alt={product.name} />
        {/* Floating price badge displayed on top of the image */}
        <span className="product-price-badge">ILS {Number(product.price).toFixed(2)}</span>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        {product.description && <p>{product.description}</p>}
      </div>
    </div>
  );
}

export default ProductCard;