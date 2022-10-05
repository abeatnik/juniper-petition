DROP TABLE IF EXISTS signatures;


CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature TEXT NOT NULL, 
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE users (
    id SERIAL primary key, 
    first_name VARCHAR(255) NOT NULL CHECK(first_name != ''), 
    last_name VARCHAR(255) NOT NULL CHECK(last_name != ''), 
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCJAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)