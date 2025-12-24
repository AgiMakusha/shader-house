import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB (increased for showcase)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
const MAX_GAME_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/gif', 
  'image/webp',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/bmp',
  'image/x-ms-bmp',
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_GAME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-compressed',
];

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image', 'game', or 'media'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isGameFile = type === 'game';
    const isMediaFile = type === 'media';
    const isVideo = file.type.startsWith('video/');
    
    // Only developers can upload game files
    // All authenticated users (developers and gamers) can upload images and videos (for showcase, avatars, etc.)
    if (isGameFile) {
      const userRole = session.user.role?.toUpperCase();
      if (userRole !== 'DEVELOPER') {
        return NextResponse.json({ error: 'Only developers can upload game files' }, { status: 403 });
      }
    }
    
    let allowedTypes: string[];
    let maxSize: number;
    let subDir: string;
    
    if (isGameFile) {
      allowedTypes = ALLOWED_GAME_TYPES;
      maxSize = MAX_GAME_SIZE;
      subDir = 'game-files';
    } else if (isMediaFile) {
      // For showcase media - allow both images and videos
      allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
      maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      subDir = 'media';
    } else {
      // Legacy image upload (for avatars, game covers, etc.)
      allowedTypes = ALLOWED_IMAGE_TYPES;
      maxSize = MAX_IMAGE_SIZE;
      subDir = 'games';
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      let errorMessage: string;
      if (isGameFile) {
        errorMessage = 'Invalid file type. Allowed: ZIP, RAR, 7Z, TAR, GZ';
      } else if (isMediaFile) {
        errorMessage = 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, HEIC, AVIF, BMP, MP4, WebM';
      } else {
        errorMessage = 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, HEIC, AVIF, BMP';
      }
      console.error(`Upload rejected: File type "${file.type}" not allowed. File name: ${file.name}`);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: isGameFile 
            ? 'File too large. Maximum size: 100MB' 
            : 'File too large. Maximum size: 5MB' 
        },
        { status: 400 }
      );
    }

    // Generate unique filename with path prefix for organization
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${subDir}/${timestamp}-${randomString}.${extension}`;

    // Check if Vercel Blob is configured
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      // Upload to Vercel Blob (token is read from BLOB_READ_WRITE_TOKEN env var automatically)
      try {
        const blob = await put(filename, file, {
          access: 'public',
          addRandomSuffix: false, // We already have timestamp + random string
        });

        // Return the Vercel Blob URL
        return NextResponse.json({ url: blob.url }, { status: 201 });
      } catch (blobError: any) {
        console.error('Vercel Blob upload failed, falling back to local storage:', blobError);
        // Fall through to local storage
      }
    }

    // Fallback to local file storage (for development)
    try {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', subDir);
      const filePath = join(uploadsDir, `${timestamp}-${randomString}.${extension}`);

      // Ensure the directory exists
      await mkdir(uploadsDir, { recursive: true });

      // Convert File to Buffer and write to disk
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(filePath, buffer);

      // Return the public URL path
      const url = `/uploads/${filename}`;
      return NextResponse.json({ url }, { status: 201 });
    } catch (localError: any) {
      console.error('Local file storage upload failed:', localError);
      throw new Error('Failed to upload file. Please check server configuration.');
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}



