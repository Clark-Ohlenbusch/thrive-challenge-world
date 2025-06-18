
import { supabase } from '@/integrations/supabase/client';

export interface UploadPhotoResult {
  url: string;
  path: string;
}

export async function uploadPhoto(
  file: File,
  userId: string
): Promise<UploadPhotoResult> {
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('challenge-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('challenge-photos')
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath
  };
}
