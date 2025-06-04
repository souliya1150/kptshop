import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  public_id: {
    type: String,
    required: true,
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

export default mongoose.models.Image || mongoose.model('Image', imageSchema); 