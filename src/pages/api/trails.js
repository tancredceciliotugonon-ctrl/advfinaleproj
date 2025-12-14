import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = await pool.getConnection();
    const [trails] = await connection.execute('SELECT * FROM trails ORDER BY name');
    connection.release();

    res.status(200).json({ trails });
  } catch (error) {
    console.error('Trails error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
