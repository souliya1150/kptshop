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
    const id = event.path.split('/').pop();

    // Handle different HTTP methods
    switch (event.httpMethod) {
      case 'PUT':
        const updateBody = JSON.parse(event.body);
        const updatedImage = await Gallery.findByIdAndUpdate(
          id,
          { ...updateBody, updatedAt: new Date() },
          { new: true }
        );
        if (!updatedImage) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Image not found' })
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedImage)
        };

      case 'DELETE':
        const deletedImage = await Gallery.findByIdAndDelete(id);
        if (!deletedImage) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Image not found' })
          };
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Image deleted successfully' })
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