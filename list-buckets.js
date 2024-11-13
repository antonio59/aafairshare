import { GoogleAuth } from 'google-auth-library';
import { createRequire } from 'module';
import fetch from 'node-fetch';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

const PROJECT_ID = 'aafairshare';

async function listBuckets() {
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

    // List all buckets in the project
    const url = `https://storage.googleapis.com/storage/v1/b?project=${PROJECT_ID}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken.token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list buckets: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('Available buckets:');
    if (result.items && result.items.length > 0) {
      result.items.forEach(bucket => {
        console.log(`- ${bucket.name} (${bucket.id})`);
      });
    } else {
      console.log('No buckets found in the project');
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', await error.response.text());
    }
  }
}

listBuckets();
