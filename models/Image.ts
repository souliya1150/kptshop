import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
  },
  public_id: {
    type: String,
    required: [true, 'Cloudinary public ID is required'],
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  tags: [{
    type: String,
  }],
  metadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number,
  },
}, {
  timestamps: true,
});

const Image = mongoose.models.Image || mongoose.model('Image', imageSchema);

export default Image; 