const {toggleFavorite, getFavorites } = require('../services/favoritesService');

const favoritesToggle = async (req, res) => {
    const { userId, pokemonId } = req.body;

    if (!userId || !pokemonId) {
        return res.status(400).json({ error: 'Missing userId or pokemonId' });
    }

    try {
        const result = await toggleFavorite(userId, pokemonId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
};

const getFavoritesCards = async (req, res) => {
    const userId = req.query.userId;
    const limit = parseInt(req.query.limit) || 24;
    const offset = parseInt(req.query.offset) || 0;
    const sort = req.query.sort || 'pokemon_id ASC';

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        const data = await getFavorites(userId, limit, offset, sort);
        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching favorites:', err);
        res.status(500).json({ error: 'Error fetching favorites' });
    }
};

module.exports = {
    favoritesToggle,
    getFavoritesCards
};
