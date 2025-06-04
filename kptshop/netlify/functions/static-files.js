const { createReadStream } = require('fs');
const { join } = require('path');
const mime = require('mime-types');

exports.handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/static-files', '');
  const filePath = join(process.cwd(), 'out', path);

  try {
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    const stream = createReadStream(filePath);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: stream,
      isBase64Encoded: false,
    };
  } catch (error) {
    return {
      statusCode: 404,
      body: 'Not Found',
    };
  }
}; 