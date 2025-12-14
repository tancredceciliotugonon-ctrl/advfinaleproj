import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export default async function handler(req, res) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { id } = req.query;

    if (req.method === 'DELETE') {
      const connection = await pool.getConnection();
      try {
        // Verify hike belongs to user
        const [hikes] = await connection.query(
          'SELECT id FROM hikes WHERE id = ? AND user_id = ?',
          [id, decoded.userId]
        );

        if (hikes.length === 0) {
          return res.status(404).json({ error: 'Hike not found' });
        }

        // Delete the hike
        await connection.query('DELETE FROM hikes WHERE id = ? AND user_id = ?', [id, decoded.userId]);
        return res.status(200).json({ message: 'Hike deleted' });
      } finally {
        connection.release();
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Delete hike error:', error);
    return res.status(500).json({ error: error.message });
  }
}
