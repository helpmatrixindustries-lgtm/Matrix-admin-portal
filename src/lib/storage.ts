import { supabase } from './supabase';

const BUCKET_NAME = 'documents';

export const uploadPDF = async (file: Blob, fileName: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`pdfs/${fileName}`, file, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const uploadQRCode = async (dataUrl: string, fileName: string): Promise<string> => {
  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`qr-codes/${fileName}`, blob, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('QR upload error:', error);
    throw error;
  }
};
