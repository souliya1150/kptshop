const mongoose = require('mongoose');

// MongoDB connection
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Gallery Schema
const gallerySchema = new mongoose.Schema({
  name: String,
  detail: String,
  imageUrl: String,
  folder: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    await connectDB();

    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'GET':
        const images = await Gallery.find({}).sort({ createdAt: -1 });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(images)
        };

      case 'POST':
        const body = JSON.parse(event.body);
        const newImage = await Gallery.create(body);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newImage)
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 