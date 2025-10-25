const bcrypt = require('bcrypt');

const compareHashedPassword = async (loginPassword, dbPassword) =>
    bcrypt.compare(loginPassword, dbPassword);


module.exports = compareHashedPassword;