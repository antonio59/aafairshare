import { GoogleAuth } from 'google-auth-library';
import { createRequire } from 'module';
import fetch from 'node-fetch';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

const PROJECT_ID = 'aafairshare';
const BUCKET_NAME = 'aafairshare.firebasestorage.app';

const corsConfiguration = [
  {
    origin: [
      'https://aafairshare.online',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://*.github.dev',
      'https://*.app.github.dev',
      'https://github.dev',
      'https://glorious-fiesta-9vxxv67qgvfjw9-5173.app.github.dev'
    ],
    method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    responseHeader: [
      'Content-Type',
      'Access-Control-Allow-Origin',
      'Content-Length',
      'Accept',
      'Authorization',
      'X-Custom-Header'
    ],
    maxAgeSeconds: 3600
  }
];

async function setCors() {
  try {
    // Create a new GoogleAuth instance
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    // Get an access token
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    console.log('Successfully obtained access token');

    // First, verify the bucket exists
    const bucketUrl = `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}`;
    const bucketResponse = await fetch(bucketUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken.token}`
      }
    });

    if (!bucketResponse.ok) {
      throw new Error(`Failed to verify bucket: ${await bucketResponse.text()}`);
    }

    const bucketInfo = await bucketResponse.json();
    console.log('Successfully verified bucket exists:', bucketInfo.name);

    // Set CORS configuration
    const corsUrl = `https://storage.googleapis.com/storage/v1/b/${BUCKET_NAME}`;
    const corsResponse = await fetch(corsUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cors: corsConfiguration
      })
    });

    if (!corsResponse.ok) {
      throw new Error(`Failed to set CORS: ${await corsResponse.text()}`);
    }

    const result = await corsResponse.json();
    console.log('Successfully updated CORS configuration');
    console.log('Current configuration:', JSON.stringify(result.cors, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
  }
}

setCors();
