import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { checkAdminAuth } from '@/lib/authServer';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadedFile extends File {
  filepath: string;
  originalFilename: string | null;
  mimetype: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check admin authentication
    const user = await checkAdminAuth(req, res);
    if (!user) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public', 'uploads'),
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit
    });

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create subdirectories for different file types
    const audioDir = path.join(uploadDir, 'audio');
    const imageDir = path.join(uploadDir, 'images');

    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file as UploadedFile;
    const uploadType = Array.isArray(fields.type) ? fields.type[0] : fields.type;

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const isImage = file.mimetype?.startsWith('image/');
    const isAudio = file.mimetype?.startsWith('audio/');

    if (uploadType === 'cover' && !isImage) {
      // Clean up invalid file
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'Cover must be an image file' });
    }

    if (uploadType === 'audio' && !isAudio) {
      // Clean up invalid file
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'Audio file required' });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.originalFilename || '');
    const filename = `${uploadType}_${timestamp}${extension}`;

    // Determine destination directory
    const destDir = uploadType === 'cover' ? imageDir : audioDir;
    const destPath = path.join(destDir, filename);

    // Move file to final destination
    fs.renameSync(file.filepath, destPath);

    // Return public URL
    const publicUrl = `/uploads/${uploadType === 'cover' ? 'images' : 'audio'}/${filename}`;

    res.status(200).json({
      success: true,
      url: publicUrl,
      filename: filename,
      type: uploadType,
      size: fs.statSync(destPath).size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}