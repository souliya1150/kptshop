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

    // Create new image
    const image = await Gallery.create({
      ...body,
      folder: body.folder || 'default',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json(image, { status: 201 });
  } catch (err) {
    console.error('Error creating image:', err);
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    );
  }
} 