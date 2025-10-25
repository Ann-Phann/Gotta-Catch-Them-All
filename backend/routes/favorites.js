const express = require('express');
const router = express.Router();

const { favoritesToggle, getFavoritesCards } = require('../controllers/favoritesController');

// favorites toggle router
router.post('/toggle', favoritesToggle);

// favorite cards router
router.get('/', getFavoritesCards);

module.exports = router;