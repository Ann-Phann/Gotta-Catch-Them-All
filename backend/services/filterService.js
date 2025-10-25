const connection = require('../db');


// Sorting options
const allowedSorts = [
    'pokemon_id ASC', 'pokemon_id DESC',
    'name ASC, pokemon_id ASC', 'name DESC, pokemon_id ASC',
    'level ASC, pokemon_id ASC', 'level DESC, pokemon_id ASC'
];

async function fetchFilteredPokemons(limit, offset, sortSql, filters) {
    let conditions = [];
    let values = [];

    if (filters.level.length > 0) {
        conditions.push(`level IN (${filters.level.map(() => '?').join(',')})`);
        values.push(...filters.level);
    }

    if (filters.type.length > 0) {
        const typeConditions = filters.type.map(() => `(type1 = ? OR type2 = ?)`).join(' OR ');
        conditions.push(`(${typeConditions})`);
        filters.type.forEach(t => values.push(t, t));
    }

    conditions.push(`hp BETWEEN ? AND ?`);
    values.push(filters.hpMin, filters.hpMax);

    conditions.push(`attack BETWEEN ? AND ?`);
    values.push(filters.attackMin, filters.attackMax);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
        SELECT * FROM Pokemon
        ${whereClause}
        ORDER BY ${sortSql}
        LIMIT ? OFFSET ?
    `;
    values.push(limit, offset);

    const [results] = await connection.query(query, values);
    return results;
}

async function getFilteredTotal(filters) {
    let conditions = [];
    let values = [];

    if (filters.level.length > 0) {
        conditions.push(`level IN (${filters.level.map(() => '?').join(',')})`);
        values.push(...filters.level);
    }

    if (filters.type.length > 0) {
        const typeConditions = filters.type.map(() => `(type1 = ? OR type2 = ?)`).join(' OR ');
        conditions.push(`(${typeConditions})`);
        filters.type.forEach(t => values.push(t, t));
    }

    conditions.push(`hp BETWEEN ? AND ?`);
    values.push(filters.hpMin, filters.hpMax);

    conditions.push(`attack BETWEEN ? AND ?`);
    values.push(filters.attackMin, filters.attackMax);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `SELECT COUNT(*) AS total FROM Pokemon ${whereClause}`;
    const [results] = await connection.query(query, values);
    return results[0].total;
}

module.exports = { getFilteredTotal, fetchFilteredPokemons};
