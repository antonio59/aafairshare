import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import firebase from 'firebase/compat/app';
import { auth, db, initializeFirebase, getCollection, getDocument, isBrowser } from '~/lib/firebase';
import { useToast } from '~/hooks/use-toast';
import { User as FirestoreUserProfile, Category, Location } from '~/shared/schema';

// Ensure window.ENV and window.firebase are defined before using them
declare global {
  interface Window {
    ENV: {
      FIREBASE_API_KEY: string;
      FIREBASE_AUTH_DOMAIN: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_STORAGE_BUCKET: string;
      FIREBASE_MESSAGING_SENDER_ID: string;
      FIREBASE_APP_ID: string;
      FIREBASE_MEASUREMENT_ID?: string;
    };
    firebase: typeof firebase;
    debugInfo: {
      timestamp: string;
      userAgent: string;
      url: string;
      errors: string[];
    };
    handleReactError: (error: Error) => void;
    __remixRouter?: any;
  }
}

// Context Type
interface AuthContextType {
  currentUser: firebase.User | null;
  userProfile: FirestoreUserProfile | null;
  allUsers: FirestoreUserProfile[];
  categories: Category[];
  locations: Location[];
  loading: boolean; // Tracks initial auth check completion
  profileLoading: boolean; // Tracks if the profile fetch is in progress
  usersLoading: boolean;
  categoriesLoading: boolean;
  locationsLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: Error | null; // For debugging purposes
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  allUsers: [],
  categories: [],
  locations: [],
  loading: true,
  profileLoading: true,
  usersLoading: true,
  categoriesLoading: true,
  locationsLoading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  error: null,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Add error state for debugging
  const [error, setError] = useState<Error | null>(null);

  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<FirestoreUserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true); // Tracks initial auth check
  const [profileLoading, setProfileLoading] = useState(true); // Tracks profile fetch
  const [usersLoading, setUsersLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize Firebase and log initialization
  useEffect(() => {
    console.log('AuthProvider initialized');

    // Try to initialize Firebase if not already initialized
    if (typeof window !== 'undefined') {
      try {
        // Try to initialize Firebase (this is safe to call multiple times)
        initializeFirebase();
        console.log('Firebase initialized or already available in AuthProvider');
      } catch (initError) {
        console.error('Failed to initialize Firebase in AuthProvider:', initError);
        setError(initError instanceof Error ? initError : new Error(String(initError)));
        if (window.debugInfo && Array.isArray(window.debugInfo.errors)) {
          window.debugInfo.errors.push('Failed to initialize Firebase in AuthProvider: ' + String(initError));
        }
      }

      // Check if Firebase is available after initialization attempt
      if (window.firebase) {
        console.log('Firebase is available in AuthProvider');
      } else {
        console.error('Firebase is STILL NOT available in AuthProvider after initialization attempt');
        setError(new Error('Firebase is not available after initialization attempt'));
        if (window.debugInfo && Array.isArray(window.debugInfo.errors)) {
          window.debugInfo.errors.push('Firebase is not available in AuthProvider after initialization attempt');
        }
      }
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process');
      console.log('Auth object:', auth);
      console.log('Firebase object:', firebase);

      // Check if auth is properly initialized
      if (!auth || typeof auth.signInWithPopup !== 'function') {
        console.error('Auth object is not properly initialized or signInWithPopup is not available');
        console.log('Attempting to reinitialize Firebase...');

        // Try to reinitialize Firebase
        const { auth: newAuth } = initializeFirebase();

        if (!newAuth || typeof newAuth.signInWithPopup !== 'function') {
          throw new Error('Firebase authentication is not properly initialized');
        }

        // Use the global Firebase instance as a fallback
        if (window.firebase && typeof window.firebase.auth === 'function') {
          const provider = new firebase.auth.GoogleAuthProvider();
          await window.firebase.auth().signInWithPopup(provider);
          return;
        }

        throw new Error('Could not initialize Firebase authentication');
      }

      // Normal flow if auth is properly initialized
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      console.log('Google sign-in successful');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  // Reusable function to fetch profile and update state
  const fetchAndSetUserProfile = useCallback(async (user: firebase.User | null): Promise<boolean> => {
    // Skip on server-side
    if (!isBrowser) {
      console.log('Skipping fetchAndSetUserProfile on server');
      return false;
    }

    if (!user) {
      setUserProfile(null);
      setProfileLoading(false);
      return false; // Indicate no profile set
    }

    // Avoid fetching if profile already matches this user's UID
    if (userProfile?.id === user.uid) {
      setProfileLoading(false); // Still ensure profile loading is false
      return true; // Indicate profile exists
    }

    setProfileLoading(true); // Set profile loading true

    try {
      // Use the getDocument helper
      const userDocRef = getDocument(`users/${user.uid}`);
      if (!userDocRef) {
        throw new Error('Could not get user document reference');
      }

      return await fetchProfileWithDb(db, user);
    } catch (error) {
      console.error("Error during profile fetch/create:", error);
      toast({
        title: "Profile Error",
        description: "Could not load your user profile.",
        variant: "destructive"
      });
      // Attempt to sign out on general fetch/create error
      try {
        await auth.signOut();
      } catch (signOutError) {
        console.error("Error signing out after profile fetch/create failure:", signOutError);
      }
      setCurrentUser(null);
      setUserProfile(null);
      return false;
    } finally {
      setProfileLoading(false); // Profile fetch/create attempt is complete
    }
  }, [toast, userProfile]);

  // Helper function to fetch profile with a specific db instance
  const fetchProfileWithDb = async (dbInstance: firebase.firestore.Firestore, user: firebase.User): Promise<boolean> => {
    let profileSet = false;

    try {
      const userDocRef = dbInstance.doc(`users/${user.uid}`);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();

        const profileDataToSet: FirestoreUserProfile = {
          id: user.uid,
          email: userData?.email || user.email || 'unknown@example.com',
          username: userData?.username || user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: userData?.photoURL || user.photoURL || undefined
        };

        // Check if Firestore photoURL needs updating from Firebase Auth
        if ((!userData?.photoURL || userData?.photoURL === '') && user.photoURL) {
          try {
            await userDocRef.update({ photoURL: user.photoURL });
            profileDataToSet.photoURL = user.photoURL; // Update local object too
          } catch (updateError) {
            console.error("Error updating photoURL in Firestore:", updateError);
          }
        }

        setUserProfile(profileDataToSet);
        profileSet = true; // Mark profile as set
      } else {
        // User document doesn't exist - Create the profile.
        const newUserProfile: FirestoreUserProfile = {
          id: user.uid,
          email: user.email || 'unknown@example.com',
          username: user.displayName || user.email?.split('@')[0] || 'New User',
          photoURL: user.photoURL || undefined,
        };

        try {
          await userDocRef.set({
            email: newUserProfile.email,
            username: newUserProfile.username,
            photoURL: newUserProfile.photoURL,
          });
          setUserProfile(newUserProfile);
          profileSet = true; // Mark profile as created and set
        } catch (createError) {
          console.error("Error creating new user profile:", createError);
          toast({
            title: "Setup Error",
            description: "Could not create your user profile. Please try again.",
            variant: "destructive"
          });
          // Attempt to sign out if profile creation fails to avoid inconsistent state
          try {
            await auth.signOut();
          } catch (signOutError) {
            console.error("Error signing out after profile creation failure:", signOutError);
          }
          setCurrentUser(null); // Ensure local state reflects sign-out
          setUserProfile(null);
          profileSet = false; // Explicitly mark as not set
        }
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the caller
    }

    return profileSet;
  };

  // Fetch All Users
  const fetchAllUsers = useCallback(async () => {
    // Skip on server-side
    if (!isBrowser) {
      console.log('Skipping fetchAllUsers on server');
      setUsersLoading(false);
      return;
    }

    setUsersLoading(true);
    try {
      // Use the getCollection helper
      const usersCol = getCollection("users");
      if (!usersCol) {
        throw new Error('Could not get users collection');
      }

      const snapshot = await usersCol.get();
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirestoreUserProfile));
      setAllUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      toast({ title: "Error", description: "Could not load user list.", variant: "destructive" });
    } finally {
      setUsersLoading(false);
    }
  }, [toast]);

  // Fetch Categories (Real-time)
  useEffect(() => {
    // Skip on server-side
    if (!isBrowser) {
      console.log('Skipping categories effect on server');
      setCategoriesLoading(false);
      return;
    }

    // Only fetch if a user is logged in
    if (!currentUser) {
      setCategories([]); // Clear categories if logged out
      setCategoriesLoading(false);
      return; // Stop if no user
    }

    setCategoriesLoading(true);

    try {
      // Use the getCollection helper
      const catCol = getCollection("categories");
      if (!catCol) {
        throw new Error('Could not get categories collection');
      }

      const q = catCol.orderBy("name");
      const unsubscribe = q.onSnapshot((snapshot) => {
        const fetchedCategories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
        setCategories(fetchedCategories);
        setCategoriesLoading(false);
      }, (error) => {
        console.error("Error fetching categories:", error);
        toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
        setCategoriesLoading(false);
      });
      return () => unsubscribe(); // Cleanup listener on unmount
    } catch (error) {
      console.error("Error setting up categories listener:", error);
      toast({ title: "Error", description: "Could not set up categories listener.", variant: "destructive" });
      setCategoriesLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, [currentUser, toast]);

  // Fetch Locations (Real-time)
  useEffect(() => {
    // Skip on server-side
    if (!isBrowser) {
      console.log('Skipping locations effect on server');
      setLocationsLoading(false);
      return;
    }

    // Only fetch if a user is logged in
    if (!currentUser) {
      setLocations([]); // Clear locations if logged out
      setLocationsLoading(false);
      return; // Stop if no user
    }

    setLocationsLoading(true);

    try {
      // Use the getCollection helper
      const locCol = getCollection("locations");
      if (!locCol) {
        throw new Error('Could not get locations collection');
      }

      const q = locCol.orderBy("name");
      const unsubscribe = q.onSnapshot((snapshot) => {
        const fetchedLocations = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Location));
        setLocations(fetchedLocations);
        setLocationsLoading(false);
      }, (error) => {
        console.error("Error fetching locations:", error);
        toast({ title: "Error", description: "Could not load locations.", variant: "destructive" });
        setLocationsLoading(false);
      });
      return () => unsubscribe(); // Cleanup listener on unmount
    } catch (error) {
      console.error("Error setting up locations listener:", error);
      toast({ title: "Error", description: "Could not set up locations listener.", variant: "destructive" });
      setLocationsLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, [currentUser, toast]);

  // Listen for auth state changes
  useEffect(() => {
    // Skip on server-side
    if (!isBrowser) {
      console.log('Skipping auth state listener on server');
      setLoading(false); // Make sure loading is false on server
      setProfileLoading(false);
      setUsersLoading(false);
      setCategoriesLoading(false);
      setLocationsLoading(false);
      return;
    }

    setLoading(true); // Ensure loading is true when the listener setup starts

    try {
      console.log('Setting up auth state listener');
      console.log('Auth object:', auth);

      // Check if auth is properly initialized
      if (!auth || typeof auth.onAuthStateChanged !== 'function') {
        console.error('Auth object is not properly initialized or onAuthStateChanged is not available');
        setError(new Error('Firebase authentication is not properly initialized'));
        setLoading(false);
        return () => {}; // Return empty cleanup function
      }

      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        try {
          console.log('Auth state changed:', user ? 'User logged in' : 'No user');
          setCurrentUser(user); // Update the user state immediately
          setLoading(false); // Auth check complete

          // Start specific loading states
          setProfileLoading(true);
          setUsersLoading(true);

          if (user) {
            // Fetch the essential user profile first
            try {
              const profileFetched = await fetchAndSetUserProfile(user);
              console.log('Profile fetched:', profileFetched);
            } catch (profileError) {
              console.error('Error fetching user profile:', profileError);
              setError(profileError instanceof Error ? profileError : new Error(String(profileError)));
            }

            // Fetch all users in the background (don't await here)
            fetchAllUsers().then(() => {
              console.log('All users fetched successfully');
            }).catch(error => {
              console.error("Background fetchAllUsers failed:", error);
              setError(error instanceof Error ? error : new Error(String(error)));
            });
            // Categories/Locations are handled by their own effects which depend on currentUser
          } else {
            // Reset states if user logs out or is initially null
            setUserProfile(null);
            setAllUsers([]);
            setProfileLoading(false); // Reset specific loading flags
            setUsersLoading(false);
            // Categories/Locations effects will clear their state due to currentUser being null
          }
        } catch (innerError) {
          console.error('Error in auth state change handler:', innerError);
          setError(innerError instanceof Error ? innerError : new Error(String(innerError)));
          setLoading(false); // Ensure loading is set to false even on error
        }
      }, (authError) => {
        // This is the error handler for onAuthStateChanged
        console.error('Auth state change error:', authError);
        setError(authError instanceof Error ? authError : new Error(String(authError)));
        setLoading(false); // Ensure loading is set to false on error
      });

      // Cleanup function
      return () => {
        console.log('Cleaning up auth state listener');
        unsubscribe();
      };
    } catch (setupError) {
      console.error('Error setting up auth state listener:', setupError);
      setError(setupError instanceof Error ? setupError : new Error(String(setupError)));
      setLoading(false); // Ensure loading is set to false on setup error
      return () => {}; // Return empty cleanup function
    }
  }, [fetchAndSetUserProfile, fetchAllUsers]);

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    currentUser,
    userProfile,
    allUsers,
    categories,
    locations,
    loading,
    profileLoading,
    usersLoading,
    categoriesLoading,
    locationsLoading,
    signInWithGoogle,
    logout,
    error, // Include error for debugging
  }), [
    currentUser, userProfile, allUsers, categories, locations,
    loading, profileLoading, usersLoading, categoriesLoading, locationsLoading,
    signInWithGoogle, logout, error
  ]);

  // Log any errors to the console and to the window.debugInfo
  useEffect(() => {
    if (error) {
      console.error('AuthContext error:', error);
      if (typeof window !== 'undefined' && window.handleReactError) {
        window.handleReactError(error);
      }
    }
  }, [error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
