import { promises as fs } from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/auth';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'community');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Create uploads directory
    await fs.mkdir(uploadDir, { recursive: true });

    // Read request body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Parse multipart/form-data
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=([a-zA-Z0-9\-]+)/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    const boundary = boundaryMatch[1];
    const parts = buffer.toString('binary').split(`--${boundary}`);

    let fileName = null;
    let fileBuffer = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.includes('filename=')) {
        const fileMatch = part.match(/filename="([^"]+)"/);
        if (fileMatch) {
          fileName = fileMatch[1];
          
          // Find content between headers and next boundary
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd === -1) continue;
          
          const contentStart = headerEnd + 4;
          const contentEnd = part.lastIndexOf('\r\n');
          
          if (contentEnd > contentStart) {
            fileBuffer = Buffer.from(part.substring(contentStart, contentEnd), 'binary');
            break;
          }
        }
      }
    }

    if (!fileName || !fileBuffer) {
      return res.status(400).json({ error: 'No file in request' });
    }

    // Save file
    const timestamp = Date.now();
    const safeName = `${decoded.userId}_${timestamp}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const filePath = path.join(uploadDir, safeName);
    const imageUrl = `/uploads/community/${safeName}`;

    await fs.writeFile(filePath, fileBuffer);

    res.status(200).json({
      image_url: imageUrl,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}
