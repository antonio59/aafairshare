import { auth } from '../firebase';

export const clearAuthCache = async () => {
  try {
    // Sign out from Firebase
    await auth.signOut();
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB data
    const databases = await window.indexedDB.databases();
    databases.forEach(db => {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    });

    // Clear Firebase specific storage
    localStorage.removeItem('firebase:host:aafairshare.firebaseapp.com');
    localStorage.removeItem('firebase:authUser:AIzaSyC8zIGv9XeuAG6gP2rXPih9tixN1zq0JYo:[DEFAULT]');
    localStorage.removeItem('user-storage');

    // Clear any persisted Zustand stores
    Object.keys(localStorage).forEach(key => {
      if (key.includes('zustand') || key.includes('persist')) {
        localStorage.removeItem(key);
      }
    });

    console.log('Authentication cache cleared successfully');
    
    // Force reload to ensure clean state
    window.location.href = '/login';
  } catch (error) {
    console.error('Error clearing auth cache:', error);
    throw new Error('Failed to clear authentication cache');
  }
};

export const handleAuthError = async (error: unknown) => {
  console.error('Authentication error:', error);
  
  if (error instanceof Error) {
    if (error.message.includes('auth/invalid-credential') ||
        error.message.includes('auth/user-token-expired') ||
        error.message.includes('permission-denied')) {
      console.log('Invalid credentials or token expired, clearing auth cache...');
      await clearAuthCache();
    }
  }
  
  throw error;
};
