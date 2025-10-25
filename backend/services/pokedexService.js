// services/pokedexService.js
const axios = require('axios');
const connection = require('../db'); // DB connection
const {getCardDetails} = require('../controllers/getCardDetails');
const { parseFiltersFromQuery } = require('../utils/filterUtils');

const totalPokemons = 300;
const limit = 100;
const numRequests = totalPokemons / limit;

function getPokemons(currentLimit, offset, sortBy = 'pokemon_id ASC', filters = {}) {
    const allowedSorts = [
        'pokemon_id ASC', 'pokemon_id DESC',
        'name ASC, pokemon_id ASC', 'name DESC, pokemon_id ASC',
        'level ASC, pokemon_id ASC', 'level DESC, pokemon_id ASC'
    ];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'pokemon_id ASC';

    let conditions = [];
    let values = [];

    // LEVEL filter (e.g. ?level=1&level=2)
    if (filters.level && filters.level.length > 0) {
        conditions.push(`level IN (${filters.level.map(() => '?').join(',')})`);
        values.push(...filters.level);
    }

    // TYPE filter (e.g. matches type1 or type2)
    if (filters.type && filters.type.length > 0) {
        const typeConditions = filters.type.map(() => `(type1 = ? OR type2 = ?)`).join(' OR ');
        conditions.push(`(${typeConditions})`);
        filters.type.forEach(t => {
            values.push(t, t); // for type1 and type2
        });
    }

    // HP range
    if (filters.hpMin !== undefined && filters.hpMax !== undefined) {
        conditions.push(`hp BETWEEN ? AND ?`);
        values.push(filters.hpMin, filters.hpMax);
    }

    // Attack range
    if (filters.attackMin !== undefined && filters.attackMax !== undefined) {
        conditions.push(`attack BETWEEN ? AND ?`);
        values.push(filters.attackMin, filters.attackMax);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT * FROM Pokemon
        ${whereClause}
        ORDER BY ${safeSort}
        LIMIT ? OFFSET ?
    `;
    values.push(currentLimit, offset);

    return connection.query(query, values)
        .then(([results]) => results)
        .catch((err) => {
            throw new Error('Error fetching Pokémon from DB: ' + err);
        });
}


function getFilteredTotal(filters = {}) {
    let conditions = [];
    let values = [];
    console.log(`filterLevel: ${filters.level}`);
    if (filters.level && filters.level.length > 0) {
        conditions.push(`level IN (${filters.level.map(() => '?').join(',')})`);
        values.push(...filters.level);
    }

    if (filters.type && filters.type.length > 0) {
        const typeConditions = filters.type.map(() => `(type1 = ? OR type2 = ?)`).join(' OR ');
        conditions.push(`(${typeConditions})`);
        filters.type.forEach(t => {
            values.push(t, t);
        });
    }

    if (filters.hpMin !== undefined && filters.hpMax !== undefined) {
        conditions.push(`hp BETWEEN ? AND ?`);
        values.push(filters.hpMin, filters.hpMax);
    }

    if (filters.attackMin !== undefined && filters.attackMax !== undefined) {
        conditions.push(`attack BETWEEN ? AND ?`);
        values.push(filters.attackMin, filters.attackMax);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT COUNT(*) AS total FROM Pokemon
        ${whereClause}
    `;

    return connection.query(query, values)
        .then(([results]) => results[0].total)
        .catch((err) => {
            throw new Error('Error counting filtered Pokémon: ' + err);
        });
}



async function fetchAndCachePokemonData() {
    try {
        let allPokemonData = [];

        // Fetch Pokémon data from the API and store it in MySQL
        for (let i = 0; i < numRequests; i++) {
            const offset = i * limit;
            const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
            const response = await axios.get(url);
            const pokemonData = response.data.results;

            const detailedCards = await Promise.all(
                pokemonData.map(async (pokemon) => getCardDetails(pokemon.url)) // Assuming getCardDetails fetches detailed Pokémon info
            );

            allPokemonData = allPokemonData.concat(detailedCards);
        }

        // Now, insert this data into MySQL using promise-based queries
        const query = `
            INSERT INTO Pokemon (pokemon_id, name, image_url, level, hp, attack, type1, type2)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            image_url = VALUES(image_url),
            level = VALUES(level),
            hp = VALUES(hp),
            attack = VALUES(attack),
            type1 = VALUES(type1),
            type2 = VALUES(type2)
        `;

        for (const pokemon of allPokemonData) {
            const { pokemon_id, name, image_url, level, hp, attack, type1, type2 } = pokemon;

            // Use promise-based query
            await connection.query(query, [pokemon_id, name, image_url, level, hp, attack, type1, type2]);
        }

        console.log('✅ Pokémon data fetched from PokeAPI and stored in MySQL!');
    } catch (error) {
        console.error('Error fetching Pokémon data from PokeAPI:', error);
    }
}

// function getTotalPokemons() {
//     return new Promise((resolve, reject) => {
//         connection.query(
//             `SELECT COUNT(*) AS total FROM Pokemon`,
//             (err, results) => {
//                 if (err) {
//                     return reject('Error counting Pokémon: ' + err);
//                 }
//                 resolve(results[0].total);
//             }
//         );
//     });
// }

function getTotalPokemons() {
    return connection.query(
        `SELECT COUNT(*) AS total FROM Pokemon`
    ).then(([results]) => results[0].total) // Accessing the total count
      .catch((err) => {
          throw new Error('Error counting Pokémon: ' + err);
      });
}

async function fetchPaginatedPokemons(currentLimit, offset, sortBy, filters) {
    try {
        const results = await getPokemons(currentLimit, offset, sortBy, filters);
        const total = await getFilteredTotal(filters);
        return { total, results };
    } catch (err) {
        throw new Error(err);
    }
}


// search Pokemon by name
function getTotalSearchPokemons(name, filters = {}) {
    let conditions = [`name LIKE ?`];
    let values = [`%${name}%`];

    // LEVEL
    if (filters.level && filters.level.length > 0) {
        conditions.push(`level IN (${filters.level.map(() => '?').join(',')})`);
        values.push(...filters.level);
    }

    // TYPE
    if (filters.type && filters.type.length > 0) {
        const typeConditions = filters.type.map(() => `(type1 = ? OR type2 = ?)`).join(' OR ');
        conditions.push(`(${typeConditions})`);
        filters.type.forEach(t => {
            values.push(t, t);
        });
    }

    // HP
    if (filters.hpMin !== undefined && filters.hpMax !== undefined) {
        conditions.push(`hp BETWEEN ? AND ?`);
        values.push(filters.hpMin, filters.hpMax);
    }

    // Attack
    if (filters.attackMin !== undefined && filters.attackMax !== undefined) {
        conditions.push(`attack BETWEEN ? AND ?`);
        values.push(filters.attackMin, filters.attackMax);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const query = `
        SELECT COUNT(*) AS total FROM Pokemon
        ${whereClause}
    `;

    return connection.query(query, values)
        .then(([results]) => results[0].total)
        .catch((err) => {
            throw new Error('Error counting filtered search Pokémon: ' + err);
        });
}


function searchPokemons(name, currentLimit, offset, sortBy = 'pokemon_id ASC', filters = {}) {
    const allowedSorts = [
        'pokemon_id ASC', 'pokemon_id DESC',
        'name ASC, pokemon_id ASC', 'name DESC, pokemon_id ASC',
        'level ASC, pokemon_id ASC', 'level DESC, pokemon_id ASC'
    ];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'pokemon_id ASC';

    let conditions = [`name LIKE ?`];
    let values = [`%${name}%`];

    // LEVEL
    if (filters.level && filters.level.length > 0) {
        conditions.push(`level IN (${filters.level.map(() => '?').join(',')})`);
        values.push(...filters.level);
    }

    // TYPE
    if (filters.type && filters.type.length > 0) {
        const typeConditions = filters.type.map(() => `(type1 = ? OR type2 = ?)`).join(' OR ');
        conditions.push(`(${typeConditions})`);
        filters.type.forEach(t => {
            values.push(t, t);
        });
    }

    // HP
    if (filters.hpMin !== undefined && filters.hpMax !== undefined) {
        conditions.push(`hp BETWEEN ? AND ?`);
        values.push(filters.hpMin, filters.hpMax);
    }

    // Attack
    if (filters.attackMin !== undefined && filters.attackMax !== undefined) {
        conditions.push(`attack BETWEEN ? AND ?`);
        values.push(filters.attackMin, filters.attackMax);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const query = `
        SELECT * FROM Pokemon
        ${whereClause}
        ORDER BY ${safeSort}
        LIMIT ? OFFSET ?
    `;

    values.push(currentLimit, offset);

    return connection.query(query, values)
        .then(([results]) => results)
        .catch((err) => {
            throw new Error('Error fetching filtered search Pokémon: ' + err);
        });
}


module.exports = { fetchAndCachePokemonData, fetchPaginatedPokemons,getTotalSearchPokemons, searchPokemons };
