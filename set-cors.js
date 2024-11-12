const { initializeApp, cert } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'aafairshare.appspot.com' // This is the correct bucket name
});

const bucket = getStorage().bucket();

const corsConfiguration = [
  {
    origin: ['https://aafairshare.online'],
    method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    responseHeader: ['Content-Type', 'Access-Control-Allow-Origin', 'Content-Length', 'Accept', 'Authorization'],
    maxAgeSeconds: 3600
  }
];

async function setCors() {
  try {
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log('CORS configuration has been updated successfully');
  } catch (error) {
    console.error('Error updating CORS configuration:', error);
    // Log more details about the error
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
  }
}

setCors();
