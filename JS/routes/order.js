const express = require('express')
const orderController = require('../controllers/order.js')
// import the required middlewares for user and order validation
const { checkUserExistence, checkOrderExistence } = require('../middlewares/middlewares.js') // Fixed: syntax consistency and matching filename

// initialize the express router with mergeParams enabled to access parameters from parent routes
const router = express.Router({ mergeParams: true })

// create a new order, validates user existence before passing to the controller
router.post('/', checkUserExistence,
    orderController.createOrder)

// retrieve all orders for a specific user, validates user existence before fetching
router.get('/', checkUserExistence, 
    orderController.getAllOrders)

// retrieve a specific order by its ID, validates both user and order existence
router.get('/:orderId', checkUserExistence, checkOrderExistence,
    orderController.getOrderById)

// update an existing order by its ID, validates both user and order existence
router.patch('/:orderId', checkUserExistence, checkOrderExistence,
    orderController.updateOrder)

// delete an order by its ID, validates both user and order existence
router.delete('/:orderId', checkUserExistence, checkOrderExistence, 
    orderController.DeleteOrder)

module.exports = router