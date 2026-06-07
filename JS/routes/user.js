const express = require('express')
const userController = require('../controllers/user.js')
// import the required middleware for user validation
const { checkUserExistence } = require('../middlewares/middlewares.js')

// initialize the express router for user management routes
const router = express.Router();

// create a new user profile with the provided registration details
router.post('/', userController.createUser)

// retrieve a specific user's details by their ID, validates existence
// before passing to controller
router.get('/:userid', checkUserExistence, userController.getUserById)

module.exports = router