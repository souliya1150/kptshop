import { Handler } from '@netlify/functions';
import connectDB from '../../lib/mongodb';
import Category from '../../models/Category';

const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    // Handle GET request
    if (event.httpMethod === 'GET') {
      const categories = await Category.find().sort({ name: 1 });
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categories),
      };
    }

    // Handle POST request
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body || '{}');
      const category = await Category.create(data);
      return {
        statusCode: 201,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Error handling categories:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler }; 