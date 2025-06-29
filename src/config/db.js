// Load environment variables from a .env file
require('dotenv').config(); 

// This file sets up a connection pool to a PostgreSQL database using the 'pg' library.
const { Pool }  = require('pg');


// Create a new pool instance with the database connection details
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log('Base de datos configurada en:', process.env.DB_HOST); // Opcional para verificar

// Export the pool instance for use in other parts of the application
module.exports = pool;
