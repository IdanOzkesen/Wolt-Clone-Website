const express = require('express');
const searchController = require('../controllers/search');
const router = express.Router();

// Map the GET request with the query parameter
router.get('/:query', searchController.search);

module.exports = router;