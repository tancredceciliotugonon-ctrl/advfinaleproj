import pool from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export default async function handler(req, res) {
  const token = getTokenFromRequest(req);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { trail_id, rating, review_text } = req.body;

  if (!trail_id || !rating || !review_text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO trail_reviews (user_id, trail_id, rating, review_text, created_at) VALUES (?, ?, ?, ?, NOW())',
      [decoded.userId, trail_id, rating, review_text]
    );
    connection.release();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
