import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5432/waveplus",
});

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database successfully.");
    client.release(); // release the client back to the pool
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL database:", err);
  }
})();

export default pool;
