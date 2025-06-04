import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Folder from '@/models/Folder';

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Create path based on parent
    let path = data.name;
    if (data.parent) {
      const parentFolder = await Folder.findById(data.parent);
      if (parentFolder) {
        path = `${parentFolder.path}/${data.name}`;
      }
    }

    const folder = await Folder.create({
      ...data,
      path,
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Error creating folder', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

interface FolderQuery {
  parent?: string | null;
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const parent = searchParams.get('parent');

    const query: FolderQuery = {};
    if (parent) {
      query.parent = parent;
    } else {
      query.parent = null;
    }

    const folders = await Folder.find(query).sort({ name: 1 });
    return NextResponse.json(folders);
  } catch (error: unknown) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Error fetching folders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 