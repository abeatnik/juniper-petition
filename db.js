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

    return this.hashPassword(password)
        .then((hash) => {
            return db.query(sql, [firstName, lastName, email, hash]);
        })
        .catch((err) => console.log(err));
};

module.exports.hashPassword = (password) => {
    console.log(
        "password-hash-function: ",
        bcrypt.genSalt().then((salt) => bcrypt.hash(password, salt))
    );
    return bcrypt.genSalt().then((salt) => bcrypt.hash(password, salt));
};

module.exports.insertSignature = (signature, userId) => {
    const sql = `
    INSERT INTO signatures (signature, user_id) 
    VALUES ($1, $2)
    RETURNING *;
    `;

    return db.query(sql, [signature, userId]);
};

module.exports.insertProfile = (userId, age, city, homepage) => {
    const sql = `
    INSERT INTO user_profiles (user_id, age, city, url) 
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `;

    return db.query(sql, [userId, age, city, homepage]);
};

module.exports.getUserByEmail = (email) => {
    const sql = `
    SELECT password, user_id, signatures.id FROM users LEFT JOIN signatures ON users.id=signatures.user_id WHERE users.email = $1;
    `;
    return db.query(sql, [email]);
};

module.exports.getUserNameById = (userId) => {
    const sql = `
    SELECT first_name FROM users WHERE users.id = $1;
    `;
    return db.query(sql, [userId]);
};

module.exports.authenticateUser = (hash, password) => {
    return bcrypt.compare(password, hash);
};

module.exports.countSignatures = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getSignatureById = (userID) => {
    const sql = `SELECT signature, id FROM signatures WHERE signatures.user_id = $1`;
    return db.query(sql, [userID]);
};

module.exports.getAllSigners = () => {
    return db.query(
        `SELECT last_name AS lastname, first_name AS firstname, signature, age, city, url FROM signatures JOIN users ON signatures.user_id=users.id LEFT JOIN user_profiles ON users.id=user_profiles.user_id ORDER BY signatures.created_at DESC;`
    );
};

module.exports.getAllSignersByCity = (city) => {
    const sql = `SELECT last_name AS lastname, first_name AS firstname, signature, age, city, url FROM signatures JOIN users ON signatures.user_id=users.id JOIN user_profile ON users.id=user_profiles.user_id WHERE user_profiles.city = $1 ORDER BY signatures.created_at DESC;`;
    return db.query(sql, [city]);
};
