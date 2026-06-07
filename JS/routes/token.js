const express = require('express')
const tokenController = require('../controllers/token.js')

// initialize the express router for authentication and token routes
const router = express.Router();

// handle user login/authentication by credentials provided in the request body
router.post('/', tokenController.getUserByCredentials)

module.exports = router