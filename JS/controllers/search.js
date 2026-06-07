const RestaurantModel = require('../models/productAndRestaurant');

/**
 * Searches for restaurants and products matching the query
 */
const search = (req, res) => {
    const { query } = req.params;
    
    if (!query) {
        return res.status(400).json({ error: "Search query is required" });
    }

    // Call the model to get combined results
    const results = RestaurantModel.searchEntities(query);
    
    // Return the combined results
    res.json(results);
};

module.exports = {
    search
};