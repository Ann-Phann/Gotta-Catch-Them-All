const bcrypt = require('bcrypt');


const hashPassword = async (plainPassword) => {
    const saltRounds = 10;

    return bcrypt.hash(plainPassword, saltRounds);
};

module.exports = hashPassword;
