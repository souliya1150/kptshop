import mongoose, { Document, Model } from 'mongoose';

export interface IGallery extends Document {
  name: string;
  detail: string;
  imageUrl: string;
  folder: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the image'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  detail: {
    type: String,
    required: [true, 'Please provide details for the image'],
    maxlength: [500, 'Details cannot be more than 500 characters'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL'],
  },
  folder: {
    type: String,
    required: true,
    default: 'default',
  },
  publicId: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
  bytes: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Gallery: Model<IGallery> = mongoose.models.Gallery || mongoose.model<IGallery>('Gallery', GallerySchema);

export default Gallery; 