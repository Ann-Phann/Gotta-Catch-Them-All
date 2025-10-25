/* eslint-disable */
// initDB.js
const connection = require('./db'); // Import the SQL connection (promise-based)
const bcrypt = require('bcrypt'); // For password hashing
const dbName = 'pokemonDB';

// Admin account details
const ADMIN_ACCOUNT = {
  username: 'admin',
  password: 'adminaA!', // Change this to a strong password!
  avatar: 'http://localhost:8080/images/avatars/pokemon-trainer.png', // or provide a URL to an admin avatar
};

async function setupDatabase() {
  try {
    // Step 1: Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`📁 Database '${dbName}' created or already exists.`);

    // Step 2: Use the created database
    await connection.query(`USE ${dbName}`);
    console.log(`📌 Now using the database '${dbName}'`);

    // Step 3: Create the User table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS User (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        user_name VARCHAR(50) NOT NULL,
        avatar VARCHAR(255),
        hash_password VARCHAR(255) NOT NULL,
        current_points INT DEFAULT 0,
        role ENUM('user', 'admin') DEFAULT 'user' NOT NULL
      )
    `);
    console.log('✅ User table created!');

    // Step 4: Create the PokemonCollection table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS PokemonCollection (
        collection_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        pokemon_id INT NOT NULL,
        count INT DEFAULT 1,
        nickname VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES User(user_id)
      )
    `);
    console.log('✅ PokemonCollection table created!');

    // Step 5: Create the Favorites table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Favorites (
        favorite_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        pokemon_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES User(user_id)
      )
    `);
    console.log('✅ Favorites table created!');

    // Step 6: Create the Questions table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Questions (
        question_id INT AUTO_INCREMENT PRIMARY KEY,
        question_text TEXT NOT NULL,
        option_a VARCHAR(100) NOT NULL,
        option_b VARCHAR(100) NOT NULL,
        option_c VARCHAR(100) NOT NULL,
        option_d VARCHAR(100) NOT NULL,
        correct_answer VARCHAR(100) NOT NULL
      )
    `);
    console.log('✅ Questions table created!');

    // Create the 'Pokemon' table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Pokemon (
        pokemon_id INT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        image_url VARCHAR(255),
        level INT DEFAULT 1,
        hp INT,
        attack INT,
        type1 VARCHAR(50),
        type2 VARCHAR(50)
      )
    `);
    console.log('✅ Pokemon table created!')

        await createAdminAccount();
        // Call this after creating the tables
        await insertPokemonQuestions();

  } catch (err) {
    console.error('❌ Error setting up the database:', err);
  }
}


async function createAdminAccount() {
  try {
    const [existingAdmin] = await connection.query(
      'SELECT * FROM User WHERE user_name = ? AND role = "admin"',
      [ADMIN_ACCOUNT.username]
    );

    if (existingAdmin.length === 0) {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(ADMIN_ACCOUNT.password, saltRounds);

      // Insert admin account
      await connection.query(
        'INSERT INTO User (user_name, avatar, hash_password, role) VALUES (?, ?, ?, "admin")',
        [ADMIN_ACCOUNT.username, ADMIN_ACCOUNT.avatar, hashedPassword]
      );
      console.log('👑 Admin account created!');
      console.log(`Username: ${ADMIN_ACCOUNT.username}`);
      console.log(`Password: ${ADMIN_ACCOUNT.password} (change this immediately!)`);
    } else {
      console.log('👑 Admin account already exists');
    }
  } catch (err) {
    console.error('❌ Error creating admin account:', err);
  }
}

// After creating the Questions table in initDB.js
async function insertPokemonQuestions() {
    try {
        await connection.query(`
            INSERT INTO Questions (question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES
            ('Which Pokémon is known as the "Electric Mouse" Pokémon?', 'Pikachu', 'Raichu', 'Emolga', 'Pachirisu', 'Pikachu'),
            ('What type is the Pokémon Charizard?', 'Fire/Flying', 'Fire/Dragon', 'Dragon/Flying', 'Fire', 'Fire/Flying'),
            ('Which of these Pokémon evolves from Eevee when exposed to a Water Stone?', 'Vaporeon', 'Jolteon', 'Flareon', 'Espeon', 'Vaporeon'),
            ('What is the highest base HP stat of any Pokémon?', '255', '250', '230', '200', '255'),
            ('Which Pokémon is number 001 in the National Pokédex?', 'Charmander', 'Pikachu', 'Bulbasaur', 'Squirtle', 'Bulbasaur'),
            ('Which of these moves is a Dragon-type move?', 'Flamethrower', 'Thunderbolt', 'Outrage', 'Ice Beam', 'Outrage'),
            ('What is the name of Ash\\'s first Pokémon?', 'Pidgey', 'Bulbasaur', 'Pikachu', 'Caterpie', 'Pikachu'),
            ('Which Pokémon is known as the "Dragon" Pokémon?', 'Gyarados', 'Dragonite', 'Salamence', 'Charizard', 'Dragonite'),
            ('How many generations of Pokémon are there currently?', '5', '7', '8', '9', '9'),
            ('Which of these Pokémon is a Legendary Pokémon?', 'Gyarados', 'Dragonite', 'Mewtwo', 'Tyranitar', 'Mewtwo')
        `);
        console.log('✅ Pokémon questions inserted!');
    } catch (err) {
        console.error('❌ Error inserting Pokémon questions:', err);
    }
}



// Call the function to set up the database
setupDatabase();

