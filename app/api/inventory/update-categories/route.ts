import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inventory from '@/models/Inventory';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { itemId, category } = await request.json();

    if (!itemId || !category) {
      return NextResponse.json(
        { error: 'Item ID and category are required' },
        { status: 400 }
      );
    }

    const item = await Inventory.findByIdAndUpdate(
      itemId,
      { $set: { category } },
      { new: true }
    );

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating item category:', error);
    return NextResponse.json(
      { error: 'Error updating item category' },
      { status: 500 }
    );
  }
} 