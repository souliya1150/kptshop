import fs from 'fs';
import path from 'path';

export async function deleteImage(imageUrl: string) {
  try {
    // Extract the filename from the URL
    const filename = imageUrl.split('/').pop();
    if (!filename) return;

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Delete the file
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
} 