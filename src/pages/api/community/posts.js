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
        const [posts] = await connection.query(
          `SELECT cp.id, cp.user_id, cp.content, cp.image_url, cp.likes_count, cp.created_at, 
                  u.username, u.profile_picture
           FROM community_posts cp 
           JOIN users u ON cp.user_id = u.id 
           ORDER BY cp.created_at DESC`
        );
        
        // Format posts with nested user object
        const formattedPosts = posts.map(post => ({
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
        }));
        
        return res.status(200).json({ posts: formattedPosts });
      } finally {
        connection.release();
      }
    } else if (req.method === 'POST') {
      const { content, image_url } = req.body;

      if (!content?.trim() && !image_url) {
        return res.status(400).json({ error: 'Post content or image required' });
      }

      const connection = await pool.getConnection();
      try {
        await connection.query(
          'INSERT INTO community_posts (user_id, content, image_url, created_at) VALUES (?, ?, ?, NOW())',
          [decoded.userId, content || null, image_url || null]
        );

        const [posts] = await connection.query(
          `SELECT cp.id, cp.user_id, cp.content, cp.image_url, cp.likes_count, cp.created_at,
                  u.username, u.profile_picture
           FROM community_posts cp 
           JOIN users u ON cp.user_id = u.id 
           WHERE cp.user_id = ? 
           ORDER BY cp.created_at DESC LIMIT 1`,
          [decoded.userId]
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
        
        return res.status(201).json({ post: formattedPost });
      } finally {
        connection.release();
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Posts error:', error);
    return res.status(500).json({ error: error.message });
  }
}
