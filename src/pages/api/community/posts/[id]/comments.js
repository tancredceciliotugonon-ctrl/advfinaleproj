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

    if (req.method === 'GET') {
      const connection = await pool.getConnection();
      try {
        const [comments] = await connection.query(
          `SELECT c.id, c.user_id, c.comment_text as content, c.created_at,
                  u.username, u.profile_picture
           FROM post_comments c
           JOIN users u ON c.user_id = u.id
           WHERE c.post_id = ?
           ORDER BY c.created_at ASC`,
          [id]
        );

        const formattedComments = comments.map(comment => ({
          id: comment.id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            username: comment.username,
            profile_picture: comment.profile_picture
          }
        }));

        return res.status(200).json({ comments: formattedComments });
      } finally {
        connection.release();
      }
    } else if (req.method === 'POST') {
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Comment content required' });
      }

      const connection = await pool.getConnection();
      try {
        // First verify the post exists
        const [posts] = await connection.query(
          'SELECT id FROM community_posts WHERE id = ?',
          [id]
        );

        if (posts.length === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }

        await connection.query(
          'INSERT INTO post_comments (post_id, user_id, comment_text, created_at) VALUES (?, ?, ?, NOW())',
          [id, decoded.userId, content]
        );

        // Get the new comment with user info
        const [newComments] = await connection.query(
          `SELECT c.id, c.user_id, c.comment_text as content, c.created_at,
                  u.username, u.profile_picture
           FROM post_comments c
           JOIN users u ON c.user_id = u.id
           WHERE c.post_id = ? AND c.user_id = ?
           ORDER BY c.created_at DESC LIMIT 1`,
          [id, decoded.userId]
        );

        if (newComments.length === 0) {
          return res.status(500).json({ error: 'Failed to create comment' });
        }

        const comment = newComments[0];
        const formattedComment = {
          id: comment.id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            username: comment.username,
            profile_picture: comment.profile_picture
          }
        };

        return res.status(201).json({ comment: formattedComment });
      } finally {
        connection.release();
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Comments error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
