import { Handler } from '@netlify/functions';
import connectDB from '@/lib/mongodb';
import Folder from '@/models/Folder';

const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
    };
  }

  try {
    await connectDB();

    // Handle GET request
    if (event.httpMethod === 'GET') {
      const parent = event.queryStringParameters?.parent || null;

      const query: { parent: string | null } = { parent };
      const folders = await Folder.find(query).sort({ name: 1 });

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folders),
      };
    }

    // Handle POST request
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      
      // Create path based on parent
      let path = data.name;
      if (data.parent) {
        const parentFolder = await Folder.findById(data.parent);
        if (parentFolder) {
          path = `${parentFolder.path}/${data.name}`;
        }
      }

      const folder = await Folder.create({
        ...data,
        path,
      });

      return {
        statusCode: 201,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folder),
      };
    }

    // Handle unsupported methods
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error: unknown) {
    console.error('Error handling folder request:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Error handling folder request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

export { handler }; 