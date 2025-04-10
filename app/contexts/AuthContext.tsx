import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
// Use modular imports
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  type User // Import User type from modular SDK
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp, // For potential future use
  type Firestore // Import Firestore type
} from 'firebase/firestore';
import { auth, db, initializeFirebase, getCollection, getDocument, isBrowser } from '~/lib/firebase'; // Keep existing imports for now, might remove db/auth later if context manages them
// Remove leftover compat type import
import { useToast } from '~/hooks/use-toast';
import { User as FirestoreUserProfile, Category, Location } from '~/shared/schema';

// Remove duplicate global type declarations - rely on central d.ts file

// Context Type
interface AuthContextType {
  currentUser: User | null; // Use modular User type
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

  const [currentUser, setCurrentUser] = useState<User | null>(null); // Use modular User type
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

  // Remove redundant Firebase initialization - it's handled in entry.client.tsx

  // Sign in with Google using modular SDK
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process using modular SDK');
      const authInstance = getAuth(); // Get modular auth instance
      const provider = new GoogleAuthProvider(); // Use modular provider
      await signInWithPopup(authInstance, provider); // Use modular signInWithPopup
      console.log('Google sign-in successful');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error; // Re-throw error to be handled by caller if necessary
    }
  };

  // Logout function
  // Logout function using modular SDK
  const logout = async () => {
    try {
      const authInstance = getAuth(); // Get modular auth instance
      await signOut(authInstance); // Use modular signOut
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  // Reusable function to fetch profile and update state
  const fetchAndSetUserProfile = useCallback(async (user: User | null): Promise<boolean> => { // Use modular User type
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
      const dbInstance = getFirestore(); // Get modular Firestore instance directly
      // Use the getDocument helper (which now uses modular 'doc')
      // const userDocRef = getDocument(`users/${user.uid}`); // getDocument is defined in firebase.client.ts, might be better to do it here
      // if (!userDocRef) {
      //   throw new Error('Could not get user document reference');
      // }

      return await fetchProfileWithDb(dbInstance, user); // Pass the modular instance
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
  const fetchProfileWithDb = async (dbInstance: Firestore, user: User): Promise<boolean> => { // Use modular Firestore and User types
    let profileSet = false;

    try {
      const userDocRef = doc(dbInstance, `users/${user.uid}`); // Use modular doc()
      const userDoc = await getDoc(userDocRef); // Use modular getDoc()

      if (userDoc.exists()) { // Call exists as a function
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
            await updateDoc(userDocRef, { photoURL: user.photoURL }); // Use modular updateDoc()
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
          await setDoc(userDocRef, { // Use modular setDoc()
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
      const dbInstance = getFirestore(); // Get modular instance
      const usersColRef = collection(dbInstance, "users"); // Use modular collection()
      const snapshot = await getDocs(usersColRef); // Use modular getDocs()
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
      const dbInstance = getFirestore(); // Get modular instance
      const catColRef = collection(dbInstance, "categories"); // Use modular collection()
      const q = query(catColRef, orderBy("name")); // Use modular query() and orderBy()
      const unsubscribe = onSnapshot(q, (snapshot) => { // Use modular onSnapshot()
        const fetchedCategories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
        setCategories(fetchedCategories);
        setCategoriesLoading(false);
      }, (error) => {
        console.error("Error fetching categories:", error);
        toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
        setCategoriesLoading(false);
      });
      return () => unsubscribe();
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
      const dbInstance = getFirestore(); // Get modular instance
      const locColRef = collection(dbInstance, "locations"); // Use modular collection()
      const q = query(locColRef, orderBy("name")); // Use modular query() and orderBy()
      const unsubscribe = onSnapshot(q, (snapshot) => { // Use modular onSnapshot()
        const fetchedLocations = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Location));
        setLocations(fetchedLocations);
        setLocationsLoading(false);
      }, (error) => {
        console.error("Error fetching locations:", error);
        toast({ title: "Error", description: "Could not load locations.", variant: "destructive" });
        setLocationsLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up locations listener:", error);
      toast({ title: "Error", description: "Could not set up locations listener.", variant: "destructive" });
      setLocationsLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, [currentUser, toast]);

  // Listen for auth state changes using modular SDK
  useEffect(() => {
    if (!isBrowser) {
      console.log('Skipping auth state listener on server');
      setLoading(false);
      setProfileLoading(false);
      setUsersLoading(false);
      setCategoriesLoading(false);
      setLocationsLoading(false);
      return;
    }

    setLoading(true);
    let unsubscribe: (() => void) | null = null;

    try {
      const authInstance = getAuth(); // Get modular auth instance
      console.log('Setting up modular onAuthStateChanged listener');

      unsubscribe = onAuthStateChanged(authInstance, async (user) => { // Use modular onAuthStateChanged
        // user object here is already the modular User type
        try {
          console.log('Auth state changed:', user ? `User logged in (${user.uid})` : 'No user');
          setCurrentUser(user); // This should now work correctly
          setLoading(false);

          setProfileLoading(true);
          setUsersLoading(true);

          if (user) {
            try {
              const profileFetched = await fetchAndSetUserProfile(user); // Pass modular User
              console.log('Profile fetched:', profileFetched);
            } catch (profileError) {
              console.error('Error fetching user profile:', profileError);
              setError(profileError instanceof Error ? profileError : new Error(String(profileError)));
            }
            // Fetch all users (don't await)
            fetchAllUsers().catch(error => { // Add catch directly
              console.error("Background fetchAllUsers failed:", error);
              setError(error instanceof Error ? error : new Error(String(error)));
            });
          } else {
            // Reset states on logout
            setUserProfile(null);
            setAllUsers([]);
            setProfileLoading(false);
            setUsersLoading(false);
          }
        } catch (innerError) {
          console.error('Error in auth state change handler:', innerError);
          setError(innerError instanceof Error ? innerError : new Error(String(innerError)));
          setLoading(false);
        }
      }, (authError) => {
        console.error('Auth state change listener error:', authError);
        setError(authError instanceof Error ? authError : new Error(String(authError)));
        setLoading(false);
      });

    } catch (setupError) {
      console.error('Error setting up auth state listener:', setupError);
      setError(setupError instanceof Error ? setupError : new Error(String(setupError)));
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up auth state listener');
        unsubscribe();
      }
    };
  }, [fetchAndSetUserProfile, fetchAllUsers]); // Dependencies remain the same

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
