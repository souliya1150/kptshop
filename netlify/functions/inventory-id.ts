import { Handler } from '@netlify/functions';
import connectDB from '../../lib/mongodb';
import Inventory from '../../models/Inventory';
import { deleteImage } from '../../lib/deleteImage';

const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const id = event.path.split('/').pop();
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Item ID is required' }),
      };
    }

    await connectDB();

    switch (event.httpMethod) {
      case 'DELETE':
        // Find the item first to get the image URL
        const itemToDelete = await Inventory.findById(id);
        if (!itemToDelete) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Item not found' }),
          };
        }

        // Delete the image file
        try {
          await deleteImage(itemToDelete.image_url);
        } catch (error) {
          console.error('Error deleting image file:', error);
          // Continue with item deletion even if image deletion fails
        }

        // Delete the item from the database
        await Inventory.findByIdAndDelete(id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Item deleted successfully' }),
        };

      case 'PUT':
        const data = JSON.parse(event.body || '{}');
        const updatedItem = await Inventory.findByIdAndUpdate(
          id,
          { $set: data },
          { new: true, runValidators: true }
        );

        if (!updatedItem) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Item not found' }),
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedItem),
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler }; 