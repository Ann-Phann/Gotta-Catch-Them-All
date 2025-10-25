// routes/pokedexRoutes.js
const express = require('express');
const router = express.Router();
const { handleGetPokemons, handleSearchPokemon, handlePurchase } = require('../controllers/pokedexController');
// Endpoint to fetch Pokémon data with pagination
router.get('/', handleGetPokemons);

// Search pokemon by name
router.get('/search', handleSearchPokemon);

// Buy pokemon cards
router.post('/purchase', handlePurchase);


module.exports = router;
