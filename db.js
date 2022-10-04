require("dotenv").config();
const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

module.exports.createSignatureEntry = (firstName, lastName, signature) => {
    const sql = `
    INSERT INTO signatures (first_name, last_name, signature, date) 
    VALUES ($1, $2, $3, to_timestamp(${Date.now() / 1000.0}))
    RETURNING *;
    `;

    return db.query(sql, [firstName, lastName, signature]);
};

module.exports.createUser = (firstName, lastName) => {
    const sql = `
    INSERT INTO signatures (first_name, last_name, date) 
    VALUES ($1, $2, to_timestamp(${Date.now() / 1000.0}))
    RETURNING *;
    `;
    return db.query(sql, [firstName, lastName]);
};

module.exports.countSignatures = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.getSignatureById = (userID) => {
    const sql = `SELECT signature FROM signatures WHERE signatures.id = $1`;
    return db.query(sql, [userID]);
};
