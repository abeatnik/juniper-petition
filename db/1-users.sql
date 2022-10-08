DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL primary key, 
    first_name VARCHAR(255) NOT NULL CHECK(first_name != ''), 
    last_name VARCHAR(255) NOT NULL CHECK(last_name != ''), 
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
