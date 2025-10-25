const mysql = require('mysql2');


const connection = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    multipleStatements: true,
    //database: 'pokemonDB'

  }).promise();

  // connection.connect((err) => {
  //   if (err) throw err;
  //   console.log('✅ Connected to MySQL server!');
  // });

module.exports = connection; // export db


