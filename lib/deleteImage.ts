import { cloudinary } from './cloudinary';

export async function deleteImage(imageUrl: string) {
  try {
    // Extract public_id from Cloudinary URL
    const publicId = imageUrl.split('/').slice(-1)[0].split('.')[0];
    if (!publicId) return;

    // Delete from Cloudinary
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
} 