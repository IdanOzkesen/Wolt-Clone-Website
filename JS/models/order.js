const productAndRestaurantModel = require('./productAndRestaurant');
// In-memory array to store all orders
let orders = [];

/**
 * Creates a new order and adds it to the storage
 */
const createOrder = (orderData) => {
    let totalPrice = 0
    for (const productId of orderData.products) {
        const product = productAndRestaurantModel.getProductById(orderData.restaurantId, productId);
        totalPrice += product.price
    }
    const newOrder = {
        id: idGenerator(),
        userId: orderData.userId,
        restaurantId: orderData.restaurantId,
        products: orderData.products || [],
        totalPrice: totalPrice,
        deliveryAddress: orderData.deliveryAddress || ''
    };
    
    orders.push(newOrder);
    
    return newOrder;
};

/**
 * Retrieves all orders belonging to a specific user
 */
const getOrdersByUser = (userId) => {
    return orders.filter(order => order.userId === userId);
};

/**
 * Retrieves a single order by its ID
 */
const getOrderById = (id) => {
    return orders.find(order => order.id === id);
};

/**
 * Updates an existing order's details (e.g., status, items)
 */
const updateOrder = (id, updateData) => {
    const index = orders.findIndex(order => order.id === id);
    // Return null if order doesn't exist
    if (index === -1) {
        return null; 
    }
    let totalPrice = 0
    for (const productId of updateData.products) {
        const product = productAndRestaurantModel.getProductById(updateData.restaurantId, productId);
        totalPrice += product.price
    }
    const newOrder = {
    id: orders[index].id,
    userId: updateData.userId,
    restaurantId: updateData.restaurantId,
    products: updateData.products || [],
    totalPrice: totalPrice,
    deliveryAddress: updateData.deliveryAddress || ''
    };
    orders[index] = newOrder;
    return newOrder;
};

/**
 * Deletes an order from the storage by its ID
 */
const deleteOrder = (id) => {
    const index = orders.findIndex(order => order.id === id);
    
    // Return false if order doesn't exist
    if (index === -1) {
        return false;
    }

    // Remove the order from the array
    orders.splice(index, 1);
    
    return true;
};

function idGenerator() {
    return Math.floor(Math.random() * 1000000000).toString(); 
}

module.exports = {
    createOrder,
    getOrdersByUser,
    getOrderById,
    updateOrder,
    deleteOrder
};