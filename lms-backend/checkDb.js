// checkDb.js - Check current database schema
const pool = require("./db");

async function checkDatabase() {
  try {
    console.log("🔍 Checking database schema...\n");

    // Get all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("📋 Tables in database:");
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    console.log("");

    // Get schema for each table
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      const columnsResult = await pool.query(`
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log(`\n📊 Table: ${tableName}`);
      console.log("─".repeat(80));
      columnsResult.rows.forEach(col => {
        const type = col.character_maximum_length 
          ? `${col.data_type}(${col.character_maximum_length})`
          : col.data_type;
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  ${col.column_name.padEnd(25)} ${type.padEnd(20)} ${nullable}${defaultVal}`);
      });
    }

    await pool.end();
    console.log("\n✅ Database check complete!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkDatabase();
