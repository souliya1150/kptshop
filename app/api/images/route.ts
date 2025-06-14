import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/mongodb';
import Image from '@/models/Image';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface ImageQuery {
  folder?: string;
  tags?: string;
}

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'kptshop',
          resource_type: 'auto',
        },
        (error: Error | undefined, result: CloudinaryUploadResult | undefined) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          }
          if (!result) {
            reject(new Error('No result from Cloudinary'));
          }
          resolve(result as CloudinaryUploadResult);
        }
      );

      uploadStream.end(buffer);
    });

    // Save to MongoDB
    const image = await Image.create({
      name: file.name,
      url: result.secure_url,
      public_id: result.public_id,
      folder: folder || null,
      tags: tags ? tags.split(',') : [],
      metadata: {
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error: unknown) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { 
        error: 'Error uploading image', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const tag = searchParams.get('tag');

    const query: ImageQuery = {};
    if (folder) query.folder = folder;
    if (tag) query.tags = tag;

    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .populate('folder');

    return NextResponse.json(images);
  } catch (error: unknown) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Error fetching images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 