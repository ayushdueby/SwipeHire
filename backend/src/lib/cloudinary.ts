import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('Cloudinary environment variables not configured. File uploads will be disabled.');
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export interface CloudinarySignatureData {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
}

export function generateUploadSignature(folder: string = 'swipehire'): CloudinarySignatureData {
  if (!apiKey || !apiSecret || !cloudName) {
    throw new Error('Cloudinary not configured');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder,
    upload_preset: 'swipehire_uploads' // You'll need to create this preset in Cloudinary
  };

  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  return {
    signature,
    timestamp,
    api_key: apiKey,
    cloud_name: cloudName
  };
}

export function isValidFileType(fileType: string, category: 'image' | 'document'): boolean {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  if (category === 'image') {
    return imageTypes.includes(fileType);
  }
  
  if (category === 'document') {
    return documentTypes.includes(fileType);
  }

  return false;
}

export function isValidFileSize(fileSize: number, category: 'image' | 'document'): boolean {
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  const maxDocumentSize = 10 * 1024 * 1024; // 10MB

  if (category === 'image') {
    return fileSize <= maxImageSize;
  }
  
  if (category === 'document') {
    return fileSize <= maxDocumentSize;
  }

  return false;
}

export { cloudinary };
