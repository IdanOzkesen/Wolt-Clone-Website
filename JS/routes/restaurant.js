const express = require('express')
const restaurantController = require('../controllers/restaurant')
const { checkRestaurantExistence, checkUserExistence } = require('../middlewares/middlewares.js');
const router = express.Router()

// Map the GET and POST requests to their respective controller functions
router.get('/', restaurantController.getAllRestaurants);
router.post('/', restaurantController.createRestaurant);
router.get('/:id', checkRestaurantExistence, restaurantController.getRestaurantById);
router.patch('/:id', checkRestaurantExistence, restaurantController.updateRestaurant);
router.delete('/:id',checkUserExistence, checkRestaurantExistence, restaurantController.deleteRestaurant);
router.get('/owner/:ownerId', restaurantController.getMyRestaurants);

module.exports = router;