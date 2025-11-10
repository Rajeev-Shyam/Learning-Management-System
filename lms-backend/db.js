// db.js
const { Pool } = require("pg");
require("dotenv").config();

console.log("🟡 Initializing PostgreSQL connection pool...");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log("🟡 Pool created, testing connection...");

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connection successful!");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    console.error("⚠️ Check your .env credentials or if PostgreSQL is running.");
  }
})();

module.exports = pool;
