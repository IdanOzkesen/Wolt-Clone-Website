const Restaurant = require('../models/productAndRestaurant'); 
const {getAllUsers} = require('../models/user.js')
const {createSocket} = require('../middlewares/middlewares.js')

// Helper function to remove productsList from the restaurant object
const cleanRestaurantData = (restaurant) => {
    if (!restaurant) return null;
    // Destructure to extract productsList, keeping the rest in 'cleaned'
    const { productsList, ...cleaned } = restaurant;
    return cleaned;
}

/**
 * Retrieves all restaurants from the system (without products)
 */
const getAllRestaurants = (req, res) => {
    const allRestaurants = Restaurant.getAllRestaurants();
    // Clean the products out of every restaurant in the array
    const cleanedRestaurants = allRestaurants.map(cleanRestaurantData);
    res.json(cleanedRestaurants);
};

/**
 * Creates a new restaurant 
 */
const createRestaurant = (req, res) => {
    // Extracting all fields based on the new model requirements
    const { name, address, category, phoneNum, ownerId, imageUrl} = req.body;
    // Validation: Return 400 Bad Request if the name is missing
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    if (!address) {
        return res.status(400).json({ error: "Address is required" });
    }
    if (!category) {
        return res.status(400).json({ error: "Category is required" });
    }
    if (!phoneNum) {
        return res.status(400).json({ error: "Phone number is required" });
    }
    if (!ownerId) {
        return res.status(400).json({ error: "ownerId required" });
    }

    // Call the model with all 4 parameters
    const newRestaurant = Restaurant.createRestaurant(name, address, category, phoneNum, ownerId, imageUrl);
    // If the restaurant already exists, return 400 Bad Request
    if (!newRestaurant) {
        return res.status(400).json({ error: "Restaurant already exists" });
    }
    // Return 201 Created with the location header of the new resource
    res.status(201).location(`/api/restaurants/${newRestaurant.id}`).send();
};

/**
 * Get a single restaurant by its ID
 */
const getRestaurantById = (req, res) => {
    const { id } = req.params;
    const restaurant = Restaurant.getRestaurantById(id);
    // Clean the products out before sending
    const cleanedRestaurant = cleanRestaurantData(restaurant);
    // Return the cleaned restaurant's details
    res.json(cleanedRestaurant);
}

/** 
 * update restaurant
 */
const updateRestaurant = (req, res) => {
    const { id } = req.params; // ID should come from params
    const { name, address, category, phoneNum, imageUrl } = req.body;
    const success = Restaurant.updateRestaurant(id, name, address, category, phoneNum, imageUrl);
    if (!success) return res.status(404).json({ error: "Restaurant not found" });
    res.status(204).end();
}

/**
 * delete restaurant
 */
const deleteRestaurant = async (req, res) => {
    const restaurantId = req.params.id;
    const userid = req.params.userid || req.get('userId')
    const restaurant = Restaurant.getRestaurantById(restaurantId);
    if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
    }
    const productsList = Restaurant.getRestaurantById(restaurantId).productsList;
    const users = getAllUsers()
    const userIds = users.map(user => user.id)
    // delete all products associated with the restaurant before deleting the restaurant itself
    const command = 'delete'
    for (const product of productsList) {
        let productId = product.id 
        let otherIds = [productId]
        Restaurant.DeleteProduct(restaurantId, productId)
        for (let id of userIds) {
            // create a socket connection or emit an event for the product deletion
            let status = await createSocket (command, id, otherIds)
        }
    }
    Restaurant.deleteRestaurant(restaurantId);
    res.status(204).end();
}

const getMyRestaurants = (req, res) => {
    const ownerId = req.params.ownerId; 
    if (!ownerId) {
        return res.status(400).json({ error: "ownerId is required" });
    }
    const restaurants = Restaurant.getRestaurantsByOwner(ownerId);
    res.json(restaurants.map(cleanRestaurantData));
}

module.exports = {
    getAllRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurants
};
