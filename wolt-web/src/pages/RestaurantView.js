import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import './RestaurantView.css';
import { apiFetch } from '../services/api';
import defaultPlaceholder from '../assets/default-placeholder.jpg';

function RestaurantView() {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            setLoading(true);
            try {
                const resDetails = await apiFetch(`/restaurants/${id}`);
                const restaurantData = await resDetails.json();
                setRestaurant(restaurantData);

                const resProducts = await apiFetch(`/restaurants/${id}/products`);
                const productsData = await resProducts.json();
                setProducts(productsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurantDetails();
    }, [id]);

    const openModal = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
    };

    const closeModal = () => setSelectedProduct(null);

    // Modal Content Component
    const ProductModal = () => (
        <div className="product-modal-overlay" onClick={closeModal}>
            <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-icon" onClick={closeModal}>✕</button>

                <div className="modal-header-image">
                    <img src={selectedProduct.image || defaultPlaceholder} alt={selectedProduct.name} />
                </div>

                <div className="modal-scrollable-body">
                    <h2 className="modal-product-title">{selectedProduct.name}</h2>
                    <div className="modal-product-price">ILS {parseFloat(selectedProduct.price).toFixed(2)}</div>
                    <p className="modal-product-description">{selectedProduct.description || "No description available."}</p>
                </div>

                <div className="modal-sticky-footer">
                    <div className="modal-quantity-selector">
                        <button className="quantity-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                        <span className="quantity-number">{quantity}</span>
                        <button className="quantity-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                    <button className="modal-add-btn" onClick={closeModal}>
                        Add to order • ILS {(parseFloat(selectedProduct.price) * quantity).toFixed(2)}
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="restaurant-view-page">
            {/* ... Hero and Main Content ... */}

            {/* Modal - Floating on top of EVERYTHING */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closeModal}>×</button>

                        <img src={selectedProduct.image || defaultPlaceholder} alt={selectedProduct.name} className="modal-img" />

                        <div className="modal-details">
                            <h2>{selectedProduct.name}</h2>
                            <p className="price">ILS {parseFloat(selectedProduct.price).toFixed(2)}</p>
                            <p className="desc">{selectedProduct.description || "No description."}</p>
                        </div>

                        <div className="modal-footer">
                            <div className="qty-controls">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                            <button className="add-btn" onClick={closeModal}>
                                Add to order • ILS {(parseFloat(selectedProduct.price) * quantity).toFixed(2)}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RestaurantView;