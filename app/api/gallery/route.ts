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
    const image = await Gallery.create(body);
    return NextResponse.json(image);
  } catch (err) {
    console.error('Error creating image:', err);
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    );
  }
} 