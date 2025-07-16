import { Pool } from 'pg';                                       // Import Pool class from pg module

const pool = new Pool({                                         // Create a new pool instance
  host: 'waveplus.cv8s0eigw2o8.eu-north-1.rds.amazonaws.com',  // RDS endpoint hostname
  port: 5432,                                                  // Port number for PostgreSQL
  user: 'wave',                                                // Database user
  password: 'uYj09DFl4zZwTVZNwRrT',                            // Database password
  database: 'waveplus',                                        // Database name
  ssl: {                                                       // SSL configuration object
    rejectUnauthorized: false                                  // Disable certificate validation
  }
});

(async () => {
  try {
    const client = await pool.connect();                       // Acquire a client from the pool
    console.log("✅ Connected to PostgreSQL database successfully.");
    client.release();                                          // Release the client back to the pool
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL database:", err);
  }
})();

export default pool;                                           // Export the pool for use elsewhere
