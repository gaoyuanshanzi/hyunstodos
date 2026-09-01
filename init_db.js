const { Pool } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_Ed8HtPTnO0Wo@ep-ancient-cell-aytbysq7-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function init() {
  try {
    const client = await pool.connect();
    console.log('Connected to Neon PostgreSQL successfully!');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS hyuns_board_state (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table hyuns_board_state is verified.');

    const res = await client.query('SELECT * FROM hyuns_board_state WHERE id = $1', ['main']);
    console.log('Current rows for main:', res.rows.length);
    
    client.release();
    await pool.end();
    console.log('DB test completed successfully.');
  } catch (err) {
    console.error('Neon DB connection error:', err);
    process.exit(1);
  }
}

init();
