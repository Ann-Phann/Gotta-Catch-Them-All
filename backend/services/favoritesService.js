const connection = require('../db');

const allowedSorts = [
    'pokemon_id ASC', 'pokemon_id DESC',
    'name ASC, pokemon_id ASC', 'name DESC, pokemon_id ASC',
    'level ASC, pokemon_id ASC', 'level DESC, pokemon_id ASC'
];

const toggleFavorite = async (userId, pokemonId) => {
    const [existing] = await connection.query(
        'SELECT * FROM Favorites WHERE user_id = ? AND pokemon_id = ?',
        [userId, pokemonId]
    );

    if (existing.length > 0) {
        await connection.query(
            'DELETE FROM Favorites WHERE user_id = ? AND pokemon_id = ?',
            [userId, pokemonId]
        );
        return { removed: true };
    } else {
        await connection.query(
            'INSERT INTO Favorites (user_id, pokemon_id) VALUES (?, ?)',
            [userId, pokemonId]
        );
        return { added: true };
    }
};

const getFavorites = async (userId, limit, offset, sort) => {
    const safeSort = allowedSorts.includes(sort) ? sort : 'pokemon_id ASC';

    const [countResult] = await connection.query(
        'SELECT COUNT(*) AS total FROM Favorites WHERE user_id = ?',
        [userId]
    );
    const total = countResult[0].total;

    const [favorites] = await connection.query(
        `SELECT p.* FROM Favorites f
         JOIN Pokemon p ON f.pokemon_id = p.pokemon_id
         WHERE f.user_id = ?
         ORDER BY ${safeSort}
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
    );

    return { results: favorites, total };
};

module.exports = {
    toggleFavorite,
    getFavorites
};
