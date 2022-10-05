require("dotenv").config();
const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

module.exports.insertUser = (firstName, lastName, email, password) => {

    // email has to be unique 


    const sql = `
    INSERT INTO users (first_name, last_name, email, hash) 
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `;

    //hash password here...

    return db.query(sql, [firstName, lastName, email, hash]);
};

module.exports.insertSignature = (userId, signature) => {
    const sql = `
    INSERT INTO signatures (userId, signature, date) 
    VALUES ($1, $2, to_timestamp(${Date.now() / 1000.0}))
    RETURNING *;
    `;

    return db.query(sql, [userId, signature]);
};

module.exports.hashPassword = () => {

}

module.exports.findUserByEmail = (email, password) => {
    //find user by email - return hash
    const sql = `
    INSERT INTO signatures (first_name, last_name, date) 
    VALUES ($1, $2))
    RETURNING *;
    `;
    return db.query(sql, [firstName, lastName]);
};

module.exports.authenticate(hash, password, userId) => {
    //if user: compare password with hash
    // true => userId 
}


module.exports.countSignatures = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`);
};

module.exports.findSignatureById = (userID) => {
    const sql = `SELECT signature FROM signatures WHERE signatures.id = $1`;
    return db.query(sql, [userID]);
};
