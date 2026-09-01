const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Ed8HtPTnO0Wo@ep-ancient-cell-aytbysq7-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require';

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000
    });
  }
  return pool;
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const p = getPool();

  try {
    if (req.method === 'GET') {
      const result = await p.query('SELECT data, updated_at FROM hyuns_board_state WHERE id = $1', ['main']);
      if (result.rows.length === 0) {
        return res.status(200).json({ success: true, data: null });
      }
      return res.status(200).json({
        success: true,
        data: result.rows[0].data,
        updatedAt: result.rows[0].updated_at
      });
    }

    if (req.method === 'POST') {
      const { data } = req.body || {};
      if (!data) {
        return res.status(400).json({ success: false, error: 'No data provided' });
      }

      await p.query(`
        INSERT INTO hyuns_board_state (id, data, updated_at)
        VALUES ('main', $1, NOW())
        ON CONFLICT (id) DO UPDATE
        SET data = EXCLUDED.data, updated_at = NOW();
      `, [JSON.stringify(data)]);

      return res.status(200).json({ success: true, message: 'Saved to Neon DB' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
