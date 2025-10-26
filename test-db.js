import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

console.log("Testing connection with:", process.env.DATABASE_URL);

try {
  const client = await pool.connect();
  console.log("✅ Connected successfully!");
  
  const result = await client.query("SELECT NOW()");
  console.log("✅ Query executed:", result.rows[0]);
  
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
  console.log("✅ Tables:", tables.rows);
  
  client.release();
  await pool.end();
} catch (err) {
  console.error("❌ Connection failed:", err.message);
  process.exit(1);
}
