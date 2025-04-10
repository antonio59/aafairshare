const { onRequest } = require("firebase-functions/v2/https");
const { createRequestHandler } = require("@remix-run/express");
const express = require("express");
const path = require("path");
const fs = require("fs");

// Create an Express app
const app = express();

// Serve static assets
app.use(express.static(path.join(process.cwd(), "../public")));
app.use(express.static(path.join(process.cwd(), "../build/client")));

// Create a Remix request handler
const remixHandler = createRequestHandler({
  build: require("../build/server/index.js"),
  mode: process.env.NODE_ENV
});

// Handle all requests with Remix
app.all("*", remixHandler);

// Export the Express app as a Firebase Function
exports.remix = onRequest({
  region: "us-central1",
  memory: "1GiB",
  maxInstances: 10
}, app);
