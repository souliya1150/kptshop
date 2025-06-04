import mongoose from 'mongoose';

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  path: {
    type: String,
    required: [true, 'Path is required'],
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Folder = mongoose.models.Folder || mongoose.model('Folder', folderSchema);

export default Folder; 