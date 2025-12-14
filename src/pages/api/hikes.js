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
        const [hikes] = await connection.query(
          `SELECT h.*, t.name as trail_name, t.location, t.difficulty 
           FROM hikes h 
           LEFT JOIN trails t ON h.trail_id = t.id 
           WHERE h.user_id = ? 
           ORDER BY h.hike_date DESC`,
          [decoded.userId]
        );
        return res.status(200).json({ hikes });
      } finally {
        connection.release();
      }
    } else if (req.method === 'POST') {
      const { trail_id, custom_trail_name, hike_date, duration_hours, distance_km, elevation_gain_m, difficulty_rating, weather_conditions, temperature_celsius, notes } = req.body;

      if (!trail_id && !custom_trail_name) {
        return res.status(400).json({ error: 'Trail ID or name required' });
      }
      if (!hike_date || !duration_hours || !distance_km) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const connection = await pool.getConnection();
      try {
        await connection.query(
          'INSERT INTO hikes (user_id, trail_id, custom_trail_name, hike_date, duration_hours, distance_km, elevation_gain_m, difficulty_rating, weather_conditions, temperature_celsius, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [decoded.userId, trail_id || null, custom_trail_name || null, hike_date, duration_hours, distance_km, elevation_gain_m || null, difficulty_rating || null, weather_conditions || null, temperature_celsius || null, notes || null]
        );
        return res.status(201).json({ message: 'Hike logged' });
      } finally {
        connection.release();
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Hikes error:', error);
    return res.status(500).json({ error: error.message });
  }
}
