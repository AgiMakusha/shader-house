import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_GAME_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
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

    // Normalize role to uppercase (handles legacy lowercase roles)
    const userRole = session.user.role?.toUpperCase();
    if (userRole !== 'DEVELOPER') {
      return NextResponse.json({ error: 'Only developers can upload images' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image' or 'game'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isGameFile = type === 'game';
    const allowedTypes = isGameFile ? ALLOWED_GAME_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = isGameFile ? MAX_GAME_SIZE : MAX_IMAGE_SIZE;
    const subDir = isGameFile ? 'game-files' : 'games';

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: isGameFile 
            ? 'Invalid file type. Allowed: ZIP, RAR, 7Z, TAR, GZ' 
            : 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP' 
        },
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', subDir);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return public URL
    const url = `/uploads/${subDir}/${filename}`;

    return NextResponse.json({ url }, { status: 201 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}



