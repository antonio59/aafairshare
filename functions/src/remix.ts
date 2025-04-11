import { onRequest } from "firebase-functions/v2/https";
import { createRequestHandler } from "@remix-run/express";
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create an Express app
const app = express();

// Serve static assets from the correct paths
app.use(express.static(path.join(__dirname, "../../public")));
app.use(express.static(path.join(__dirname, "../../build/client")));

// Create a Remix request handler
const getLoadContext = (req: any, res: any) => ({
  env: process.env
});

// We'll need to dynamically import the build in the deployed function
export const createRemixRequestHandler = async () => {
  let build;
  try {
    // Try different possible paths for the build
    try {
      build = await import("../../build/server/index.js");
    } catch (importError) {
      // Fallback to a relative path from the current file
      console.log("Trying alternative build path...");
      build = await import(path.join(process.cwd(), "build/server/index.js"));
    }
  } catch (error) {
    console.error("Error importing Remix build:", error);
    // Provide a fallback or empty build object
    build = { default: {} };
  }
  
  return createRequestHandler({
    build,
    mode: process.env.NODE_ENV as "development" | "production",
    getLoadContext
  });
};

// Create the Express app with all routes handled by Remix
export const createRemixApp = async () => {
  const remixHandler = await createRemixRequestHandler();
  
  // Handle all requests with Remix
  app.all("*", (req, res, next) => {
    // Set CORS headers for all requests
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
      // Handle preflight requests
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
      return;
    }
    
    remixHandler(req, res, next);
  });
  
  return app;
};

// Export the Express app as a Firebase Function
export const remix = onRequest({
  region: "us-central1",
  memory: "1GiB",
  maxInstances: 10,
  minInstances: 0,
}, async (req, res) => {
  const app = await createRemixApp();
  return app(req, res);
});