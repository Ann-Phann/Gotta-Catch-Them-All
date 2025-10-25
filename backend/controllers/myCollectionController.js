const db = require('../db');

const getUserCollection = async (req, res) => {
  // pokemon_id found in Pokemon table, contains name, image_url, level, hp, attack, type1, type2
  // use pokemon_id from PokemonCollection as a foreign key and display related information

  const { userId } = req.params;
  const limit = parseInt(req.query.limit, 10) || 24;
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    const [results] = await db.query(
      `SELECT Pokemon.pokemon_id, name, image_url, level, hp, attack, type1, type2, nickname, count
       FROM Pokemon
       INNER JOIN PokemonCollection ON Pokemon.pokemon_id = PokemonCollection.pokemon_id
       WHERE user_id = ?
       ORDER BY Pokemon.pokemon_id ASC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total
       FROM PokemonCollection
       WHERE user_id = ?`,
      [userId]
    );

    res.json({
      total: countResult[0].total,
      results
    });
  }

  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUserCollection };