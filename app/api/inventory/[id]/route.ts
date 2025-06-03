import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inventory from '@/models/Inventory';
import { deleteImage } from '@/lib/deleteImage';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    // Find the item first to get the image URL
    const item = await Inventory.findById(id);
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Delete the image file
    try {
      await deleteImage(item.image_url);
    } catch (error) {
      console.error('Error deleting image file:', error);
      // Continue with item deletion even if image deletion fails
    }

    // Delete the item from the database
    await Inventory.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Error deleting item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const data = await request.json();
    
    const item = await Inventory.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Error updating item' },
      { status: 500 }
    );
  }
} 