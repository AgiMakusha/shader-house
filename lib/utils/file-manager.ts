import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Deletes a file from the public uploads directory
 * @param fileUrl - The public URL of the file (e.g., /uploads/game-files/123.zip)
 * @returns true if deleted, false if file doesn't exist
 */
export async function deleteUploadedFile(fileUrl: string): Promise<boolean> {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
    return false; // Not a local uploaded file
  }

  try {
    // Convert public URL to file system path
    const filePath = join(process.cwd(), 'public', fileUrl);
    
    if (!existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return false;
    }

    await unlink(filePath);
    console.log(`✅ Deleted file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete file: ${fileUrl}`, error);
    return false;
  }
}

/**
 * Safely replaces an old file with a new one
 * @param oldFileUrl - The old file URL to delete
 * @param newFileUrl - The new file URL (for logging)
 */
export async function replaceFile(oldFileUrl: string | null, newFileUrl: string): Promise<void> {
  if (oldFileUrl && oldFileUrl !== newFileUrl) {
    await deleteUploadedFile(oldFileUrl);
  }
}








