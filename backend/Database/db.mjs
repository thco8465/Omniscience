import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize pg-promise
const pgp = pgPromise();

// Use either the connection string or individual parameters
const db = pgp(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
} : {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || 'omnipotent',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'ArkhamknightN7?'
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
// Create achievements table if it does not exist
db.none(`
    CREATE TABLE IF NOT EXISTS public.achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      bronze INTEGER DEFAULT 0,
      silver INTEGER DEFAULT 0,
      gold INTEGER DEFAULT 0,
      CONSTRAINT achievements_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
    )
  `)
    .then(() => {
        console.log('Achievements table created or already exists');
    })
    .catch(error => {
        console.error('Error creating achievements table:', error);
    });
// Create items table if it does not exist
db.none(`
    CREATE TABLE IF NOT EXISTS public.items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50),
      price_gold INTEGER DEFAULT 0,
      price_silver INTEGER DEFAULT 0,
      price_bronze INTEGER DEFAULT 0,
      image_url TEXT,
      style_class VARCHAR(255),
      CONSTRAINT items_name_type_key UNIQUE (name, type),
      CONSTRAINT items_type_check CHECK (type = ANY (ARRAY['background', 'avatar', 'card']))
    )
  `)
    .then(() => {
        console.log('Items table created or already exists');
    })
    .catch(error => {
        console.error('Error creating items table:', error);
    });
// Create leaderboards table if it does not exist
db.none(`
    CREATE TABLE IF NOT EXISTS public.leaderboards (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      game_name VARCHAR(255) NOT NULL,
      score INTEGER NOT NULL,
      create_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT leaderboards_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
    .then(() => {
      console.log('Leaderboards table created or already exists');
    })
    .catch(error => {
      console.error('Error creating leaderboards table:', error);
    });
  // Create user_items table if it does not exist
db.none(`
    CREATE TABLE IF NOT EXISTS public.user_items (
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      equipped BOOLEAN DEFAULT FALSE,
      CONSTRAINT user_items_pkey PRIMARY KEY (user_id, item_id),
      CONSTRAINT user_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      CONSTRAINT user_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)
    .then(() => {
      console.log('User items table created or already exists');
    })
    .catch(error => {
      console.error('Error creating user items table:', error);
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
