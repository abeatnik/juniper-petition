require("dotenv").config();
const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

function createSignatureEntry(firstName, lastName, signature) {
    const sql = `
    INSERT INTO signatures (first_name, last_name, signature, date) 
    VALUES (1$ 2$ 3$ 4$)
    RETURNING id;
    `;

    return db.query(sql, [firstName, lastName, signature, new Date().toString]);
}

function countSignatures() {
    return db.query(`SELECT COUNT(*) FROM signatures`);
}

module.exports = {
    createSignatureEntry,
    countSignatures,
};
