import { onRequest } from "firebase-functions/v2/https";
import { createRemixApp } from "./src/remix";

// Export the Express app as a Firebase Function
export const remix = onRequest({
  region: "us-central1",
  memory: "1GiB",
  maxInstances: 10,
  minInstances: 0,
  cors: true
}, await createRemixApp());
