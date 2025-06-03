import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64String = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(dataURI, {
        folder: 'kptshop',
        resource_type: 'auto',
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    // Return the Cloudinary URL
    // Define a type for the result to avoid using 'any'
    type CloudinaryUploadResult = {
      secure_url: string;
      [key: string]: unknown;
    };

    const { secure_url } = result as CloudinaryUploadResult;
    return NextResponse.json({ url: secure_url });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 