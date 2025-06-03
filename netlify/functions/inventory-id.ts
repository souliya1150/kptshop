import { Handler } from '@netlify/functions';
import connectDB from '../../lib/mongodb';
import Inventory from '../../models/Inventory';
import { deleteImage } from '../../lib/deleteImage';

const handler: Handler = async (event) => {
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
    console.log('Request method:', event.httpMethod);
    console.log('Query parameters:', event.queryStringParameters);
    console.log('Request body:', event.body);

    const id = event.queryStringParameters?.id;
    if (!id) {
      console.log('No ID provided in query parameters');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Item ID is required' }),
      };
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    switch (event.httpMethod) {
      case 'DELETE':
        // Find the item first to get the image URL
        console.log('Finding item to delete:', id);
        const itemToDelete = await Inventory.findById(id);
        if (!itemToDelete) {
          console.log('Item not found for deletion:', id);
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Item not found' }),
          };
        }

        // Delete the image file
        try {
          console.log('Deleting image:', itemToDelete.image_url);
          await deleteImage(itemToDelete.image_url);
        } catch (error) {
          console.error('Error deleting image file:', error);
          // Continue with item deletion even if image deletion fails
        }

        // Delete the item from the database
        console.log('Deleting item from database:', id);
        await Inventory.findByIdAndDelete(id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Item deleted successfully' }),
        };

      case 'PUT':
        console.log('Parsing request body for update');
        const data = JSON.parse(event.body || '{}');
        console.log('Update data:', data);

        console.log('Updating item:', id);
        const updatedItem = await Inventory.findByIdAndUpdate(
          id,
          { $set: data },
          { new: true, runValidators: true }
        );

        if (!updatedItem) {
          console.log('Item not found for update:', id);
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Item not found' }),
          };
        }

        console.log('Item updated successfully:', updatedItem);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedItem),
        };

      default:
        console.log('Method not allowed:', event.httpMethod);
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
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