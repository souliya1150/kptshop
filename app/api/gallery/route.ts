import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Fetching images...');
    const images = await Gallery.find({}).sort({ createdAt: -1 });
    console.log('Found images:', images.length);
    
    return NextResponse.json(images);
  } catch (err) {
    console.error('Error fetching images:', err);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body:', body);

    // Validate required fields
    const requiredFields = ['name', 'detail', 'imageUrl', 'publicId', 'width', 'height', 'format', 'bytes'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.error(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Ensure folder is set
    const folder = body.folder || 'default';
    console.log('Using folder:', folder);

    // Create new image with all required fields
    console.log('Creating image in MongoDB...');
    const image = await Gallery.create({
      name: body.name,
      detail: body.detail,
      imageUrl: body.imageUrl,
      folder: folder,
      publicId: body.publicId,
      width: body.width,
      height: body.height,
      format: body.format,
      bytes: body.bytes,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Verify the image was created
    if (!image) {
      console.error('Failed to create image in database');
      throw new Error('Failed to create image in database');
    }

    console.log('Image created successfully:', image);
    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    console.error('Error creating image:', err);
    return NextResponse.json(
      { error: 'Failed to create image in database', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 