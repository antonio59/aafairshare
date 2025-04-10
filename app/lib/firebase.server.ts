// SERVER-SIDE FIREBASE IMPLEMENTATION
// This file provides mock implementations for server-side rendering

import type firebase from 'firebase/compat/app';

// Create mock implementations for Firebase services
const createMockFirebaseServices = () => {
  // Mock Firestore implementation
  const mockFirestore = {
    collection: () => {
      console.log('Server: Mock Firestore collection called');
      return {
        doc: () => ({
          get: async () => ({
            exists: false,
            data: () => null,
            id: 'mock-id'
          }),
          set: async () => {},
          update: async () => {}
        }),
        where: () => mockFirestore.collection(),
        orderBy: () => mockFirestore.collection(),
        limit: () => mockFirestore.collection(),
        get: async () => ({
          empty: true,
          docs: [],
          size: 0
        }),
        onSnapshot: (callback: any) => {
          // Call the callback with empty data
          callback({
            empty: true,
            docs: [],
            size: 0
          });
          // Return a function to unsubscribe
          return () => {};
        }
      };
    },
    doc: () => ({
      get: async () => ({
        exists: false,
        data: () => null,
        id: 'mock-id'
      }),
      set: async () => {},
      update: async () => {}
    })
  };

  // Mock Auth implementation
  const mockAuth = {
    onAuthStateChanged: (callback: any) => {
      // Call the callback with null (no user)
      callback(null);
      // Return a function to unsubscribe
      return () => {};
    },
    signInWithPopup: async () => {
      throw new Error('Auth operations are not available on the server');
    },
    signOut: async () => {
      throw new Error('Auth operations are not available on the server');
    },
    currentUser: null,
    setPersistence: async () => {}
  };

  // Mock Functions implementation
  const mockFunctions = {
    httpsCallable: () => async () => ({ data: null })
  };

  return {
    app: {} as firebase.app.App,
    auth: mockAuth as unknown as firebase.auth.Auth,
    db: mockFirestore as unknown as firebase.firestore.Firestore,
    functions: mockFunctions as unknown as firebase.functions.Functions,
    firebase: {
      auth: {
        GoogleAuthProvider: class MockGoogleAuthProvider {},
        Auth: { Persistence: { LOCAL: 'LOCAL' } }
      }
    } as unknown as typeof firebase
  };
};

// Create and export mock services
const { app, auth, db, functions, firebase } = createMockFirebaseServices();

// Helper functions that return null on the server
export const getCollection = () => null;
export const getDocument = () => null;

// Export the mock services
export { firebase, auth, db, functions };

// Export a no-op initialization function
export function initializeFirebase() {
  console.log('Server: Mock Firebase initialization called');
  return { app, auth, db, functions };
}
