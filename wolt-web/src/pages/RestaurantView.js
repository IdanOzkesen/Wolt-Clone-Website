import React, { useState, useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import './RestaurantView.css';
import { apiFetch } from '../services/api';
import { useCart } from '../context/CartContext'; // 1. Imported the cart context
import defaultPlaceholder from '../assets/default-placeholder.jpg';
import { AuthContext } from '../context/AuthContext';
import FormModal from '../components/FormModal';

// Field definitions reused by the owner edit/add popups
const restaurantFields = [
  { name: 'name', label: 'Restaurant Name', placeholder: 'Enter Restaurant Name', required: true },
  { name: 'address', label: 'Address', placeholder: 'Enter Address', required: true },
  { name: 'category', label: 'Category', placeholder: 'Enter Category', required: true },
  { name: 'phoneNum', label: 'Phone Number', placeholder: 'Enter Phone Number', required: true },
  { name: 'imageUrl', label: 'Restaurant Photo', type: 'file', required: false },
];

const productFields = [
  { name: 'name', label: 'Product Name', placeholder: 'Enter Product Name', required: true },
  { name: 'description', label: 'Description', placeholder: 'Enter Description', required: true },
  { name: 'category', label: 'Category', placeholder: 'Enter Category', required: true },
  { name: 'price', label: 'Price', type: 'number', placeholder: 'Enter Price', required: true },
  { name: 'imageUrl', label: 'Product Photo', type: 'file', required: false },
];

function RestaurantView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userData, isLoggedIn } = useContext(AuthContext);
  // 2. Destructure the addToCart function from our global state
  const { addToCart } = useCart();
  const location = useLocation();


  // State Management
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuSectionRef = useRef(null);

  // Product popup state: which product is open and how many units to add
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Owner edit/add popup state
  const [showEditRestaurant, setShowEditRestaurant] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // 3. Ownership Check: Ensure types match by converting both to String
  const isOwner = isLoggedIn && userData && restaurant &&
    String(userData.userId) === String(restaurant.ownerId);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setLoading(true);
      try {
        const resDetails = await apiFetch(`/restaurants/${id}`);
        if (!resDetails.ok) throw new Error('Restaurant not found');
        const restaurantData = await resDetails.json();
        setRestaurant(restaurantData);

        const resProducts = await apiFetch(`/restaurants/${id}/products`);
        if (resProducts.ok) {
          const productsData = await resProducts.json();
          setProducts(productsData);
        }
      } catch (err) {
        // 4. Log error to console for debugging
        console.error("Error loading restaurant data:", err);
        setError(err.message || 'Failed to sync with server.');
      } finally {
        setLoading(false);
      }
    };


    fetchRestaurantDetails();
  }, [id]);

  useEffect(() => {
    if (products.length > 0 && location.state?.openProductId) {
      const productToOpen = products.find(p => p.id === location.state.openProductId);

      if (productToOpen) {
        openProductModal(productToOpen);

        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [products, location.state, navigate, location.pathname]);

  const handleDeleteRestaurant = async () => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      const res = await apiFetch(`/restaurants/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': userData.userId
        }
      });
      if (res.ok) navigate("/", { replace: true });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const res = await apiFetch(`/restaurants/${id}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'userId': userData.userId
        }
      });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
      }
    }
  };

  // Open the product popup, always starting the quantity back at 1
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setModalQuantity(1);
  };

  const closeProductModal = () => setSelectedProduct(null);

  const increaseQuantity = () => setModalQuantity(prev => prev + 1);
  const decreaseQuantity = () => setModalQuantity(prev => Math.max(1, prev - 1));

  // Add the chosen quantity of the selected product to the cart, then close the popup
  const handleAddToOrder = () => {
    for (let i = 0; i < modalQuantity; i++) {
      addToCart(selectedProduct, restaurant);
    }
    closeProductModal();
  };

  // Reload the product list from the server (used after adding a product)
  const refetchProducts = async () => {
    const resProducts = await apiFetch(`/restaurants/${id}/products`);
    if (resProducts.ok) {
      setProducts(await resProducts.json());
    }
  };

  // Save edits to the restaurant (PATCH), then reflect them locally
  const handleEditRestaurant = async (formData) => {
    const res = await apiFetch(`/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.name,
        address: formData.address,
        category: formData.category,
        phoneNum: formData.phoneNum,
        imageUrl: formData.imageUrl
      })
    });
    if (res.ok) {
      setRestaurant(prev => ({ ...prev, ...formData }));
      setShowEditRestaurant(false);
    } else {
      alert("Failed to update restaurant");
    }
  };

  // Create a new product (POST), then refresh the menu
  const handleAddProduct = async (formData) => {
    const res = await apiFetch(`/restaurants/${id}/products`, {
      method: 'POST',
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        imageUrl: formData.imageUrl
      })
    });
    if (res.ok) {
      await refetchProducts();
      setShowAddProduct(false);
    } else {
      alert("Failed to add product");
    }
  };

  // Save edits to a product (PATCH), then update it locally
  const handleEditProduct = async (formData) => {
    const res = await apiFetch(`/restaurants/${id}/products/${editingProduct.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        imageUrl: formData.imageUrl
      })
    });
    if (res.ok) {
      setProducts(prev => prev.map(p =>
        p.id === editingProduct.id
          ? { ...p, ...formData, price: Number(formData.price) }
          : p
      ));
      setEditingProduct(null);
    } else {
      alert("Failed to update product");
    }
  };

  if (loading) return <div className="wolt-loading-screen">Loading menu...</div>;
  if (error) return <div className="wolt-error-screen">⚠️ Error: {error}. <Link to="/">Back to Home</Link></div>;
  if (!restaurant) return null;

  return (
    <div className="restaurant-view-page">
      <header
        className="restaurant-hero"
        style={{
          backgroundImage: `url(${restaurant.imageUrl || defaultPlaceholder})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content">
            {/* 5. Display edit button for restaurant if the current user is the owner */}
            <h1 className="restaurant-view-name">
              {restaurant.name}
              {isOwner && (
                <>
                  <button className="edit-pencil-btn" onClick={() => setShowEditRestaurant(true)} aria-label="Edit">✏️</button>
                  <button className="delete-btn" onClick={handleDeleteRestaurant} aria-label="Delete">🗑️</button>
                </>
              )}
            </h1>
            <p className="restaurant-view-meta">📍 {restaurant.address} • 📞 {restaurant.phoneNum}</p>
          </div>
        </div>
      </header>

      <main className="restaurant-view-body">
        <section className="menu-products-section" ref={menuSectionRef}>
          <div className="menu-header-row">
            <h2 className="section-menu-title">Popular Items</h2>
            {/* 6. Add product button visible only to the restaurant owner */}
            {isOwner && <button className="add-product-btn" onClick={() => setShowAddProduct(true)}>+ Add Product</button>}
          </div>

          {products.length === 0 ? (
            <p className="no-products-msg">No items found in this restaurant's menu.</p>
          ) : (
            <div className="products-grid-layout">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="product-item-card"
                  onClick={() => openProductModal(product)}
                >
                  <div className="product-card-details">
                    <h3 className="product-title-text">
                      {product.name}
                      {isOwner && (
                        <>
                          <span className="product-edit-icon" onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }} aria-label="Edit">✏️</span>
                          <span className="product-delete-icon" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }} aria-label="Delete">🗑️</span>
                        </>
                      )}
                    </h3>
                    <p className="product-desc-text">{product.description}</p>
                    <span className="product-price-text">₪{parseFloat(product.price).toFixed(2)}</span>
                  </div>

                  <div className="product-image-block">
                    {/* The + button opens the same product popup */}
                    <button
                      className="add-to-cart-action-btn"
                      onClick={(e) => { e.stopPropagation(); openProductModal(product); }}
                    >
                      +
                    </button>
                    <img
                      src={product.imageUrl || defaultPlaceholder}
                      alt={product.name}
                      className="product-dish-img"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product popup: image, name, price, description, quantity selector + add-to-order button */}
      {
        selectedProduct && createPortal(
          <div className="product-modal-backdrop" onClick={closeProductModal}>
            <div className="product-modal-sheet" onClick={(e) => e.stopPropagation()}>
              <button className="product-modal-close" onClick={closeProductModal} aria-label="Close">✕</button>

              <div className="product-modal-img-wrap">
                <img
                  src={selectedProduct.imageUrl || selectedProduct.image || defaultPlaceholder}
                  alt={selectedProduct.name}
                  className="product-modal-img"
                />
              </div>

              <div className="product-modal-body">
                <h2 className="product-modal-name">{selectedProduct.name}</h2>
                <span className="product-modal-price">₪{parseFloat(selectedProduct.price).toFixed(2)}</span>
                <p className="product-modal-desc">
                  {selectedProduct.description || "No description available."}
                </p>
              </div>

              <div className="product-modal-footer">
                <div className="quantity-selector">
                  <button className="qty-btn" onClick={decreaseQuantity} aria-label="Decrease">−</button>
                  <span className="qty-value">{modalQuantity}</span>
                  <button className="qty-btn" onClick={increaseQuantity} aria-label="Increase">+</button>
                </div>
                <button className="add-to-order-btn" onClick={handleAddToOrder}>
                  Add to Order · ₪{(parseFloat(selectedProduct.price) * modalQuantity).toFixed(2)}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Owner: edit the restaurant's details */}
      <FormModal
        isOpen={showEditRestaurant}
        onClose={() => setShowEditRestaurant(false)}
        title="Edit Restaurant"
        fields={restaurantFields}
        initialValues={{
          name: restaurant.name,
          address: restaurant.address,
          category: restaurant.category,
          phoneNum: restaurant.phoneNum,
          imageUrl: restaurant.imageUrl
        }}
        submitLabel="Save Changes"
        onSubmit={handleEditRestaurant}
      />

      {/* Owner: add a new product to the menu */}
      <FormModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        title="Add Product"
        fields={productFields}
        initialValues={{}}
        submitLabel="Add Product"
        onSubmit={handleAddProduct}
      />

      {/* Owner: edit an existing product */}
      <FormModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Edit Product"
        fields={productFields}
        initialValues={editingProduct ? {
          name: editingProduct.name,
          description: editingProduct.description,
          category: editingProduct.category,
          price: editingProduct.price,
          imageUrl: editingProduct.imageUrl
        } : {}}
        submitLabel="Save Changes"
        onSubmit={handleEditProduct}
      />
    </div >
  );
}

export default RestaurantView;