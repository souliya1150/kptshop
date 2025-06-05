import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// GET handler
export async function GET() {
  try {
    console.log('GET /api/gallery - Connecting to MongoDB...');
    await connectDB();
    
    const images = await Gallery.find({}).sort({ createdAt: -1 });
    console.log(`Found ${images.length} images`);
    
    return NextResponse.json(images);
  } catch (error) {
    console.error('GET /api/gallery - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/gallery - Connecting to MongoDB...');
    await connectDB();
    
    const body = await request.json();
    console.log('POST /api/gallery - Request body:', body);

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

    // Create new image
    const image = await Gallery.create({
      name: body.name,
      detail: body.detail,
      imageUrl: body.imageUrl,
      folder: body.folder || 'default',
      publicId: body.publicId,
      width: body.width,
      height: body.height,
      format: body.format,
      bytes: body.bytes,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('POST /api/gallery - Image created:', image);
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('POST /api/gallery - Error:', error);
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    );
  }
} 