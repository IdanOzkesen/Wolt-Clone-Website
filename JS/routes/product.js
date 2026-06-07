const express = require('express')
const productController = require('../controllers/product.js')
// import the required middlewares for user, restaurant, and product validation
const { checkRestaurantExistence, checkProductExistence, checkUserExistence } = require('../middlewares/middlewares.js')

// initialize the express router with mergeParams enabled to access parameters from parent routes
const router = express.Router({ mergeParams: true })

// retrieve all products for a specific restaurant, validates user and restaurant 
// existence before fetching
router.get('/', checkRestaurantExistence, 
    productController.getAllProducts)

// create a new product inside a restaurant, validates user and restaurant 
// existence before passing to the controller
router.post('/', checkRestaurantExistence, 
    productController.createProduct)

// retrieve a specific product by its ID, validates user and product existence
router.get('/:productId', checkUserExistence, checkRestaurantExistence, checkProductExistence, 
    productController.getProductById)

// update an existing product's details by its ID, validates user and product existence
router.patch('/:productId', checkRestaurantExistence, checkProductExistence, 
    productController.updateProduct)

// delete a product by its ID, validates user and product existence
router.delete('/:productId', checkUserExistence, checkRestaurantExistence, checkProductExistence, 
    productController.DeleteProduct)

module.exports = router