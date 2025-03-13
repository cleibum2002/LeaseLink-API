const { Pool } = require("pg"); // ✅ Use PostgreSQL instead of MySQL
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432, // PostgreSQL default port
    ssl: { rejectUnauthorized: false } // ✅ Required for Render's PostgreSQL
});

module.exports = pool;
