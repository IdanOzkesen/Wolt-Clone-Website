const express = require('express');
const productModel = require('../models/productAndRestaurant.js')
const {getAllUsers} = require('../models/user.js')
const {createSocket} = require('../middlewares/middlewares.js')

// get all products for a specific restaurant, requires userId in headers and restaurantId in parameters
const getAllProducts = (req, res) => {
    const restaurantId = req.params.restaurantId
    // get the list of all products by calling getAllProducts function in the product model
    const productList = productModel.getAllProducts(restaurantId)
    res.json(productList)
}

// create a new product, the request body should contain name, description, category, and price
const createProduct = (req, res) => {
    const restaurantId = req.params.restaurantId
    const {name, description, category, price} = req.body
    // check if restaurant ID and all required fields are present
    if(!restaurantId || !name || !description || !category || !price) {
        res.status(400).json({eror: "Missing required fields: restaurantId, name, description, category, or price"})
        return
    }
    // create a new product by calling the createProduct function in the product model
    const newproduct = productModel.createProduct(restaurantId, name, description, category, price)
    // if the product creation fails, return a 404 error
    if(newproduct === null) {
        res.status(404).json({ error: "Product already exists" })
        return
    }

    // Return 201 Created and set the Location header instead of returning JSON
    res.status(201).location(`/api/restaurants/${restaurantId}/products/${newproduct.id}`).send()
}

// get a specific product by its ID and restaurant ID, requires userId in headers
const getProductById = async (req, res) => {
    const userId = req.get('userId')
    const restaurantId = req.params.restaurantId
    const productId = req.params.productId

    // get the order by calling getOrderById function in the order model
    const product = productModel.getProductById(restaurantId, productId)
    const command = 'patch'
    const otherIds = [productId]
    // create a socket connection or emit an event for the product retrieval
    const status = await createSocket (command, userId, otherIds)
    // if the socket creation fails, return a 404 error
    if (!status) {
        res.status(404).json({error: "Failed to create socket connection"})
        return
    }
    res.json(product)
}

// update an existing product, the request body should contain updated product details
const updateProduct = (req, res) => {
    const restaurantId = req.params.restaurantId
    const productId = req.params.productId
    const {name, description, category, price} = req.body
    // check if restaurant ID, product ID, and all required fields are present
    if(!restaurantId || !productId || !name || !description || !category || !price) {
        res.status(400).json({error: "Missing required fields: restaurantId, productId, name, description, category, or price"})
        return
    }
    // update the product by calling the updateProduct function in the product model
    const updatedProduct = productModel.updateProduct(restaurantId, productId, 
        name, description, category, price)
    // if the product update fails or product is not found, return a 404 error
    if(!updatedProduct) {
        res.status(404).json({error: "Product not found or failed to update"})
        return
    }
    // Return 204 No Content for successful PATCH operations (no body returned)
    res.status(204).send()
}

// delete a specific product by its ID and restaurant ID
const DeleteProduct = async (req, res) => {
    const userId = req.get('userId')
    const restaurantId = req.params.restaurantId
    const productId = req.params.productId
    // check if restaurant ID, product ID, and user ID are present
    if(!restaurantId || !productId || !userId) {
        res.status(400).json({error: "Missing required fields: restaurantId, productId, or userId"})
        return
    }
    // delete the product by calling the DeleteProduct function in the product model
    productModel.DeleteProduct(restaurantId, productId) 
    const command = 'delete'
    const otherIds = [productId]
    const users = getAllUsers()
    const userIds = users.map(user => user.id)
    for (const id of userIds) {
        // create a socket connection or emit an event for the product deletion
        const status = await createSocket (command, id, otherIds)
    }
    res.status(204).send()
}

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    DeleteProduct
}