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

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const connection = await pool.getConnection();
    try {
      // Check if user already liked this post
      const [existing] = await connection.query(
        'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
        [id, decoded.userId]
      );

      if (existing.length > 0) {
        // Unlike
        await connection.query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [id, decoded.userId]);
        await connection.query('UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = ?', [id]);
      } else {
        // Like
        await connection.query(
          'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
          [id, decoded.userId]
        );
        await connection.query('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?', [id]);
      }

      // Get updated post
      const [posts] = await connection.query(
        `SELECT cp.id, cp.user_id, cp.content, cp.image_url, cp.likes_count, cp.created_at,
                u.username, u.profile_picture
         FROM community_posts cp 
         JOIN users u ON cp.user_id = u.id 
         WHERE cp.id = ?`,
        [id]
      );

      const post = posts[0];
      const formattedPost = {
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        image_url: post.image_url,
        likes_count: post.likes_count || 0,
        created_at: post.created_at,
        user: {
          username: post.username,
          profile_picture: post.profile_picture
        }
      };

      return res.status(200).json({ post: formattedPost });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Like error:', error);
    return res.status(500).json({ error: error.message });
  }
}
