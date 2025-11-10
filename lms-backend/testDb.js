// testDb.js - Test database connection and initialization
require("dotenv").config();
const pool = require("./db");
const { initializeDatabase } = require("./initDb");

async function testDatabase() {
  try {
    console.log("🔍 Testing database connection...");
    
    // Test connection
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");
    
    // Initialize database
    console.log("\n📊 Initializing database schema...");
    await initializeDatabase();
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log("\n✅ Database tables created:");
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Count users
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Current users in database: ${userCount.rows[0].count}`);
    
    client.release();
    console.log("\n✅ Database test completed successfully!");
    process.exit(0);
    
  } catch (err) {
    console.error("❌ Database test failed:", err.message);
    console.error(err);
    process.exit(1);
  }
}

testDatabase();
