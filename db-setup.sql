DROP TABLE IF EXISTS signatures;


CREATE TABLE signatures (
    id SERIAL primary key, 
    first_name VARCHAR(255) NOT NULL CHECK(first_name != ''), 
    last_name VARCHAR(255) NOT NULL CHECK(last_name != ''), 
    signature TEXT NOT NULL, 
    date TIMESTAMP NOT NULL
    );