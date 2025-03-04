import pgPromise from 'pg-promise'; // Import pg-promise correctly
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize pg-promise
const pgp = pgPromise();

// Create a connection pool using environment variables
const db = pgp({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'omnipotent',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'ArkhamknightN7?', // Secure your credentials
});

// Create users table
db.none(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  )
`)
    .then(() => {
        console.log('Users table created or already exists');
    })
    .catch(error => {
        console.error('Error creating users table:', error);
    });

// Check the connection
db.connect()
    .then(obj => {
        console.log('Connected to the database');
        obj.done(); // Release the connection
    })
    .catch(error => {
        console.error('Error connecting to the database:', error);
    });

export default db;
