import mongoose, { Document, Model } from 'mongoose';

export interface IGallery extends Document {
  name: string;
  detail: string;
  imageUrl: string;
  folder: string;
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
    default: 'default',
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