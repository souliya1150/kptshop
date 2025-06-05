import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Gallery from '@/models/Gallery';

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const images = await Gallery.find({}).sort({ createdAt: -1 });
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
    await connectDB();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'detail', 'imageUrl', 'publicId', 'width', 'height', 'format', 'bytes'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Ensure folder is set
    const folder = body.folder || 'default';

    // Create new image with all required fields
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
      throw new Error('Failed to create image in database');
    }

    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    console.error('Error creating image:', err);
    return NextResponse.json(
      { error: 'Failed to create image in database' },
      { status: 500 }
    );
  }
} 