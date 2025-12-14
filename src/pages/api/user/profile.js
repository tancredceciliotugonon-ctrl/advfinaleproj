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

    if (req.method === 'GET') {
      const connection = await pool.getConnection();
      try {
        const [users] = await connection.query(
          'SELECT id, username, email, bio, location, profile_picture FROM users WHERE id = ?',
          [decoded.userId]
        );
        const user = users[0];
        return res.status(200).json({ user });
      } finally {
        connection.release();
      }
    } else if (req.method === 'PUT') {
      const { username, email, bio, location } = req.body;

      const connection = await pool.getConnection();
      try {
        await connection.query(
          'UPDATE users SET username = ?, email = ?, bio = ?, location = ? WHERE id = ?',
          [username, email, bio || null, location || null, decoded.userId]
        );

        const [users] = await connection.query('SELECT id, username, email, bio, location, profile_picture FROM users WHERE id = ?', [decoded.userId]);
        const user = users[0];
        return res.status(200).json({ user });
      } finally {
        connection.release();
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: error.message });
  }
}
