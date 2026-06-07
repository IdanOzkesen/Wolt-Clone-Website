const express = require('express');
const orderModel = require('../models/order.js');
// Importing models to validate restaurant and products data from the request body
const productAndRestaurantModel = require('../models/productAndRestaurant.js');

// Create a new order
// Assumes user existence is already validated by the router middleware
const createOrder = (req, res) => {
    const {userId, restaurantId, products, deliveryAddress} = req.body;
    
    // Check if all required fields are present
    if (!userId || !restaurantId || !deliveryAddress) {
        return res.status(400).json({ error: "Missing required text fields: userId, restaurantId, or deliveryAddress" });
    }
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "Products must be a non-empty array" });
    }

    // Validate that the requested restaurant exists
    const restaurant = productAndRestaurantModel.getRestaurantById(restaurantId);
    if (!restaurant) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
    }

    // Validate that all requested products exist within the specified restaurant
    for (let productId of products) {
        productId = String(productId).trim();
        const product = productAndRestaurantModel.getProductById(restaurantId, productId);
        if (!product) {
            res.status(404).json({ error: `Product with id ${productId} not found in this restaurant` });
            return;
        }
    }
    

    // Create the order
    const newOrder = orderModel.createOrder({userId, restaurantId, products, deliveryAddress});
    
    if(newOrder === null) {
        res.status(400).json({error: "Failed to create order"})
        return;
    }
    
    // Return 201 Created and set the Location header to the new order's URI
    res.status(201).location(`/api/orders/${newOrder.id}`).send();
}

// Get all orders for a specific user
const getAllOrders = (req, res) => {
    const userId = req.params.userid;
    if(!userId) {
        res.status(400).json({error: "Missing required parameter: userId"})
        return;
    }
    
    const orderList = orderModel.getOrdersByUser(userId);
    res.json(orderList);
}

// Get a specific order by its ID
const getOrderById = (req, res) => {
    const orderId = req.params.orderId
    if(!orderId) {
        res.status(400).json({error: "Missing required parameter: userId"})
        return
    }
    
    const order = orderModel.getOrderById(orderId);
    res.json(order);
}

// Update an existing order
// Assumes order existence is already validated by the router middleware
const updateOrder = (req, res) => {
    const orderId = req.params.orderId;
    const {userId, restaurantId, products, deliveryAddress} = req.body;
    
    // Check if order ID and all required fields are present
    if(!orderId || !userId || !restaurantId || !products || !deliveryAddress) {
        res.status(400).json({ error: "Missing required fields: orderId, userId, restaurantId, products, or deliveryAddress" });
        return;
    }

    // Fetch the existing order to check ownership
    const existingOrder = orderModel.getOrderById(orderId);
    
    // Enforce ownership: Ensure the user trying to update the order is the actual owner
    if (existingOrder.userId !== userId) {
        res.status(400).json({ error: "Forbidden: User can only edit his own orders" });
        return;
    }

    // Validate the new restaurant and products
    const restaurant = productAndRestaurantModel.getRestaurantById(restaurantId);
    if (!restaurant) {
        res.status(404).json({ error: "Restaurant not found" });
        return;
    }
    
    if (Array.isArray(products)) {
        for (let productId of products) {
            productId = String(productId).trim();
            const product = productAndRestaurantModel.getProductById(restaurantId, productId);
            if (!product) {
                res.status(404).json({ error: `Product with id ${productId} not found in this restaurant` });
                return;
            }
        }
    }

    // Update the order
    const order = orderModel.updateOrder(orderId,{userId, restaurantId, products, deliveryAddress});
    
    if(!order) {
        res.status(400).json({error: "Failed to update order"});
        return;
    }
    
    // Return 204 No Content for successful PATCH operations (no body returned)
    res.status(204).send();
}

// Delete an order by its ID
// Assumes order existence is already validated by the router middleware
const DeleteOrder = (req, res) => {
    const orderId = req.params.orderId;
    
    // Retrieve the user ID of the person requesting the deletion
    const requestingUserId = req.get('userId') || req.body.userId;
    
    if(!orderId || !requestingUserId) {
        res.status(400).json({ error: "Missing required parameter: orderId or userId" });
        return;
    }

    // Fetch the existing order to check ownership
    const existingOrder = orderModel.getOrderById(orderId);
    
    // Enforce ownership: Ensure the user trying to delete the order is the actual owner
    if (existingOrder.userId !== requestingUserId) {
        res.status(400).json({ error: "Forbidden: User can only delete his own orders" });
        return;
    }

    // Delete the order
    orderModel.DeleteOrder(orderId);
    
    // Return 204 No Content for successful DELETE operations
    res.status(204).send();
}

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    DeleteOrder
}