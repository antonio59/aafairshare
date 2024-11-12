const { GoogleAuth } = require('google-auth-library');
const serviceAccount = require('./serviceAccountKey.json');

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();
  console.log(token.token);
}

getAccessToken();
