import pool from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;
  const token = getTokenFromRequest(req);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM gear WHERE id = ? AND user_id = ?', [id, decoded.userId]);
    connection.release();

    res.status(200).json({ message: 'Gear deleted successfully' });
  } catch (error) {
    console.error('Delete gear error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
