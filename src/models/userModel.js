const pool = require("../config/database");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = {

    async getAllUsers() {

        const { rows } = await pool.query(
            "SELECT * FROM users"
        );

        return rows;
    },

    async getUserById(id) {

        const { rows } = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [id]
        );

        return rows[0];
    },

    async createUser(name, email, password) {

        const { rows } = await pool.query(
            `INSERT INTO users
                (name, email, password)
             VALUES
                ($1, $2, $3)
             RETURNING name, email, password`,
            [name, email, password]
        );

        return rows[0];
    },
    async getUserByEmailId(email) {
         const { rows } = await pool.query(
            "SELECT id, name, email FROM users WHERE email = $1",
            [email]
        );

        return rows[0];
    },
    async getJWT (id) {
        //console.log("user ",id, process.env.JWT_TOKEN)
        const token = await jwt.sign({id: id}, process.env.JWT_TOKEN,{
                    expiresIn : '7d'
                });

        return token;
    },

    async velidateUserPassword (email, passwordInputByUser) {

          const result = await pool.query(
    'SELECT id, password FROM users WHERE email = $1',
    [email]
  );
    if (result.rowCount === 0) {
    return false;
  }

  const user = result.rows[0];
    const passwordHash = user.password;

    const isPasswordCorrect = await bcrypt.compare(passwordInputByUser, passwordHash)

    return isPasswordCorrect;
}

};

module.exports = User;