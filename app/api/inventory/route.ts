import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inventory from '@/models/Inventory';

export async function GET() {
  try {
    await connectDB();
    const items = await Inventory.find().sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (err: unknown) {
    console.error('GET inventory error:', err); // now using 'err'
    return NextResponse.json(
      { error: 'Error fetching inventory items' },
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
  } catch (err: unknown) {
    console.error('POST inventory error:', err); // now using 'err'
    return NextResponse.json(
      { error: 'Error creating inventory item' },
      { status: 500 }
    );
  }
}
