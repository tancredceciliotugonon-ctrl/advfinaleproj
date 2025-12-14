import pool from '@/lib/db';
import { generateToken, validateEmail, validatePassword } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const connection = await pool.getConnection();
    const [existingUsers] = await connection.execute('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.execute(
      'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [username, email, hashedPassword]
    );

    const [newUsers] = await connection.execute('SELECT id, username, email FROM users WHERE email = ?', [email]);
    connection.release();

    const user = newUsers[0];
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
