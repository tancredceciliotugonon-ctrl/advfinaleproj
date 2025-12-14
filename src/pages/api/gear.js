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
        const [gear] = await connection.query(
          'SELECT id, user_id, name, category, brand, weight_grams, notes, purchase_date, image_url, created_at FROM gear WHERE user_id = ? ORDER BY name',
          [decoded.userId]
        );
        return res.status(200).json({ gear: gear || [] });
      } finally {
        connection.release();
      }
    } else if (req.method === 'POST') {
      const { name, category, brand, weight_grams, notes, purchase_date, image_url } = req.body;

      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category required' });
      }

      const connection = await pool.getConnection();
      try {
        await connection.query(
          'INSERT INTO gear (user_id, name, category, brand, weight_grams, notes, purchase_date, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [decoded.userId, name, category, brand || null, weight_grams || null, notes || null, purchase_date || null, image_url || null]
        );
        return res.status(201).json({ message: 'Gear added' });
      } finally {
        connection.release();
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Gear API error:', error.message, error.stack);
    return res.status(500).json({ error: error.message || 'Server error', details: error.stack });
  }
}
