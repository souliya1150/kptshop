import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inventory from '@/models/Inventory';

export async function GET() {
  try {
    await connectDB();
    const items = await Inventory.find().sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error: unknown) {
    console.error('Error fetching inventory items:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Error fetching inventory items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const item = await Inventory.create(data);
    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating inventory item:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Error creating inventory item', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
