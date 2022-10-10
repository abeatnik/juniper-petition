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

module.exports.insertProfile = (userId, age, city, url) => {
    const sql = `
    INSERT INTO user_profiles (user_id, age, city, url) 
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `;

    return db.query(sql, [userId, age, city, url]);
};

module.exports.getUserByEmail = (email) => {
    const sql = `
    SELECT password, users.id AS user_id, signatures.id AS signature_id FROM users LEFT JOIN signatures ON users.id=signatures.user_id WHERE users.email = $1;
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

module.exports.countSignaturesInCity = (city) => {
    const sql = `SELECT COUNT(*) FROM signatures JOIN user_profiles ON signatures.user_id=user_profiles.user_id WHERE city= $1`;
    return db.query(sql, [city]);
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
    const sql = `SELECT last_name AS lastname, first_name AS firstname, signature, age, url FROM signatures JOIN users ON signatures.user_id=users.id JOIN user_profiles ON users.id=user_profiles.user_id WHERE user_profiles.city = $1 ORDER BY signatures.created_at DESC;`;
    return db.query(sql, [city]);
};

module.exports.getUserInfo = (userId) => {
    const sql = `SELECT last_name AS lastname, first_name AS firstname, email, age, city, url FROM users JOIN user_profiles ON users.id=user_profiles.user_id WHERE users.id=$1;`;
    return db.query(sql, [userId]);
};

module.exports.updateUserData = (
    userId,
    firstname,
    lastname,
    email,
    password
) => {
    if (!password) {
        const sql = `UPDATE users SET first_name=$1, last_name=$2, email=$3 WHERE id=$4;`;
        return db.query(sql, [firstname, lastname, email, userId]);
    } else {
        const sql = `UPDATE users SET first_name=$1, last_name=$2, email=$3, password=$4 WHERE id=$5;`;
        return db.query(sql, [firstname, lastname, email, password, userId]);
    }
};

module.exports.updateUserProfile = (userId, age, city, url) => {
    const sql = `
        INSERT INTO user_profiles (age, city, url, user_id)
        VALUES($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age=$1, city=$2, url=$3, user_id=$4;`;
    return db.query(sql, [age, city, url, userId]);
};

module.exports.deleteSignature = (signatureId) => {
    const sql = `DELETE FROM signatures WHERE id=$1;`;
    return db.query(sql, [signatureId]);
};

module.exports.deleteAllUserData = (userId) => {
    return Promise.all([
        db.query(`DELETE FROM signatures WHERE user_id=$1;`, [userId]),
        db.query(`DELETE FROM user_profiles WHERE user_id=$1;`, [userId]),
        db.query(`DELETE FROM users WHERE id=$1;`, [userId]),
    ]);
};
