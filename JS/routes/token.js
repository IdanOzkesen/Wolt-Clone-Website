const express = require('express')
const tokenController = require('../controllers/token.js')

// initialize the express router for authentication and token routes
const router = express.Router();

// handle user login/authentication by credentials provided in the request body
router.post('/', tokenController.getUserByCredentials)

// handle token refresh requests by providing a valid refresh token in the request body
router.post('/refresh', tokenController.refreshTokenHandler)

// handle user logout by invalidating the provided refresh token in the request body
router.post('/logout', tokenController.logoutHandler)

module.exports = router