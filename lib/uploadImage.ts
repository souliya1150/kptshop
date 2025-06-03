export async function uploadImage(file: File): Promise<string> {
  try {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });

    // Create form data for Cloudinary upload
    const formData = new FormData();
    formData.append('file', `data:${file.type};base64,${base64}`);
    formData.append('upload_preset', 'kptshop_preset'); // You'll need to create this in Cloudinary
    formData.append('cloud_name', 'dhhyonknp');

    // Upload directly to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dhhyonknp/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
} 