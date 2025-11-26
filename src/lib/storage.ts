// File upload with XP-based limits using Supabase Storage
import { supabase } from './supabase';

const STORAGE_BUCKET = 'chat-files';

// Get file size limit based on XP
export const getFileSizeLimit = (xp: number): number => {
  if (xp < 100) {
    return 5 * 1024 * 1024; // 5MB
  } else if (xp < 500) {
    return 25 * 1024 * 1024; // 25MB
  } else {
    return 100 * 1024 * 1024; // 100MB
  }
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Upload file to Supabase Storage
export const uploadFile = async (
  file: File,
  userId: string,
  userXp: number
): Promise<{ url: string; path: string }> => {
  // Check file size against XP limit
  const maxSize = getFileSizeLimit(userXp);
  if (file.size > maxSize) {
    throw new Error(
      `File size (${formatFileSize(file.size)}) exceeds your limit (${formatFileSize(maxSize)})`
    );
  }

  // Generate unique file path
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const fileExt = file.name.split('.').pop();
  const fileName = `${timestamp}_${randomStr}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  try {
    // Upload file to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get file URL');
    }

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('File upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Delete file from Supabase Storage
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
};
