const mongoose = require('mongoose');

// MongoDB connection
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Gallery Schema
const gallerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  detail: { type: String, required: true },
  imageUrl: { type: String, required: true },
  folder: { type: String, required: true, default: 'default' },
  publicId: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  format: { type: String, required: true },
  bytes: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create model if it doesn't exist
const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    await connectDB();

    // Handle GET request
    if (event.httpMethod === 'GET') {
      const images = await Gallery.find({}).sort({ createdAt: -1 });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(images)
      };
    }

    // Handle POST request
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);

      // Validate required fields
      const requiredFields = ['name', 'detail', 'imageUrl', 'publicId', 'width', 'height', 'format', 'bytes'];
      for (const field of requiredFields) {
        if (!body[field]) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Missing required field: ${field}` })
          };
        }
      }

      const image = await Gallery.create({
        ...body,
        folder: body.folder || 'default',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(image)
      };
    }

    // Handle unsupported methods
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 