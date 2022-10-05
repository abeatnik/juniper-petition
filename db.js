require("dotenv").config();
const bcrypt = require("bcryptjs");
const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

module.exports.insertUser = (firstName, lastName, email, password) => {
    const sql = `
    INSERT INTO users (first_name, last_name, email, password) 
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `;

    this.hashPassword(password)
        .then((hash) => {
            return db.query(sql, [firstName, lastName, email, hash]);
        })
        .catch((err) => console.log(err));
};

module.exports.insertSignature = (signature, userId) => {
    const sql = `
    INSERT INTO signatures (signature, user_id) 
    VALUES ($1, $2)
    RETURNING *;
    `;

    return db.query(sql, [signature, userId]);
};

module.exports.hashPassword = (password) => {
    return bcrypt.genSalt().then((salt) => bcrypt.hash(password, salt));
};

module.exports.findUserByEmail = (email) => {
    const sql = `
    SELECT password FROM users WHERE users.email = $1;
    `;
    return db.query(sql, [email]);
};

module.exports.authenticate = (hash, password) => {
    return bcrypt
        .compare(password, hash)
        .then((authenticated) => authenticated)
        .catch((err) => console.log(err));
};

module.exports.countSignatures = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.findSignatureById = (userID) => {
    const sql = `SELECT signature FROM signatures WHERE signatures.user_id = $1`;
    return db.query(sql, [userID]);
};
