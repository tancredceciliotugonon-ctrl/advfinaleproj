import pool from '@/lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = await pool.getConnection();
    const [reviews] = await connection.execute(
      `SELECT tr.*, u.username FROM trail_reviews tr 
       JOIN users u ON tr.user_id = u.id 
       WHERE tr.trail_id = ? 
       ORDER BY tr.created_at DESC`,
      [id]
    );
    connection.release();

    res.status(200).json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
