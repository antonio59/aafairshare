// Re-export Firebase services from client implementation
export {
  app,
  auth,
  db,
  functions,
  initializeFirebase,
  getCollection,
  getDocument
} from './firebase.client';

// Note: This barrel file ensures proper Firebase service exports
// while maintaining client/server separation