import pool from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
  const token = getTokenFromRequest(req);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = await pool.getConnection();

    const [totalHikes] = await connection.execute(
      'SELECT COUNT(*) as count FROM hikes WHERE user_id = ?',
      [decoded.userId]
    );

    const [totalDistance] = await connection.execute(
      'SELECT COALESCE(SUM(distance_km), 0) as total FROM hikes WHERE user_id = ?',
      [decoded.userId]
    );

    const [totalElevation] = await connection.execute(
      'SELECT COALESCE(SUM(elevation_gain_m), 0) as total FROM hikes WHERE user_id = ?',
      [decoded.userId]
    );

    connection.release();

    res.status(200).json({
      stats: {
        total_hikes: totalHikes[0].count,
        total_distance: totalDistance[0].total,
        total_elevation: totalElevation[0].total
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
