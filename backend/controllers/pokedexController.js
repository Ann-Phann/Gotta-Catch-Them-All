// controllers/pokedexController.js
const db = require('../db');

const { getTotalSearchPokemons, searchPokemons, getTotalPurchasedPokemons, getPurchasedPokemons } = require('../services/pokedexService');
const { getFilteredTotal, fetchFilteredPokemons } = require('../services/filterService');
const { parseFiltersFromQuery } = require('../utils/filterUtils');
const sortKeyToSql = {
    sortByNameAtoZ: 'name ASC, pokemon_id ASC',
    sortByNameZtoA: 'name DESC, pokemon_id ASC',
    sortByIdAscending: 'pokemon_id ASC',
    sortByIdDescending: 'pokemon_id DESC',
    sortByLevelAscending: 'level ASC, pokemon_id ASC',
    sortByLevelDescending: 'level DESC, pokemon_id ASC'
};


async function handleGetPokemons(req, res) {
    const limit = parseInt(req.query.limit, 10) || 24;
    const offset = parseInt(req.query.offset, 10) || 0;
    const sortKey = req.query.sort || 'sortByIdAscending';
    const sortSql = sortKeyToSql[sortKey] || 'pokemon_id ASC';
    const filters = parseFiltersFromQuery(req.query);
    try {
        const results = await fetchFilteredPokemons(limit, offset, sortSql, filters);
        const total = await getFilteredTotal(filters);
        res.json({ total, results });
    } catch (err) {
        console.error('Error in controller:', err);
        res.status(500).json({ error: 'Failed to fetch Pokémon data from DB' });
    }
}

// Pokemon search
async function handleSearchPokemon(req, res) {
    const name = req.query.name || '';
    const limit = parseInt(req.query.limit, 10) || 24;
    const offset = parseInt(req.query.offset, 10) || 0;
    const sortKey = req.query.sort || 'sortByIdAscending';
    const sortSql = sortKeyToSql[sortKey] || 'pokemon_id ASC';

    try {
        const total = await getTotalSearchPokemons(name);
        const results = await searchPokemons(name, limit, offset, sortSql);

        res.json({ total, results });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed: ' + err.message });
    }
}

async function handlePurchase(req, res) {
    const { user } = req.session;
    const { pokemon_id, cost } = req.body;

    // Check user login status
    if (!user) return res.status(401).json({ error: 'Not logged in' });
    if (!pokemon_id || !cost) return res.status(400).json({ error: 'Missing data' });

    try {
        const [rows] = await db.query('SELECT current_points FROM User WHERE user_id = ?', [user.user_id]);

        if (!rows[0]) return res.status(404).json({ error: 'User not found' });

        // // check if they already buy it or not
        // const [already_pokemon] = await db.query('SELECT ? FROM PokemonCollection WHERE pokemon_id = ?', [user.user_id, pokemon_id]);
        // if (already_pokemon && already_pokemon.length > 0) {
        //     console.log('bought already'); // debug
        //     return res.status(400).json({error: 'You already own this pokemon'});
        // }
        if (rows[0].current_points < cost) {
            return res.status(400).json({ error: 'Not enough points' });
        }

        await db.query('UPDATE User SET current_points = current_points - ? WHERE user_id = ?', [cost, user.user_id]);

        try {
            await db.query('INSERT INTO PokemonCollection (user_id, pokemon_id) VALUES (?, ?)', [user.user_id, pokemon_id]);
        } catch (insertError) {
            if (insertError.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'You already own this Pokémon.' });
            }
            throw insertError;
        }

        req.session.user.current_points -= cost;

        res.json({
            message: 'Card purchased!',
            newPoints: req.session.user.current_points
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
}



module.exports = { handleGetPokemons, handleSearchPokemon,handlePurchase };
