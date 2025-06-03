import { Handler } from '@netlify/functions';
import connectDB from '../../lib/mongodb';
import Inventory from '../../models/Inventory';

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
    await connectDB();

    switch (event.httpMethod) {
      case 'GET':
        const items = await Inventory.find().sort({ createdAt: -1 });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(items),
        };

      case 'POST':
        const data = JSON.parse(event.body || '{}');
        const item = await Inventory.create(data);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(item),
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