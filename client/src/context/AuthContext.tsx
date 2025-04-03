import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'; // Added useMemo
// Removed unused AuthError import
// Import getRedirectResult
import { onAuthStateChanged, User as FirebaseAuthUser, getRedirectResult } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { User as FirestoreUserProfile, Category, Location } from '@shared/schema'; // Added Category, Location

// Context Type
interface AuthContextType {
  currentUser: FirebaseAuthUser | null;
  userProfile: FirestoreUserProfile | null;
  allUsers: FirestoreUserProfile[]; // Added
  categories: Category[]; // Added
  locations: Location[]; // Added
  loading: boolean; // Tracks initial auth check completion
  profileLoading: boolean; // Tracks if the profile fetch is in progress
  usersLoading: boolean; // Added
  categoriesLoading: boolean; // Added
  locationsLoading: boolean; // Added
}

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
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<FirestoreUserProfile[]>([]); // Added
  const [categories, setCategories] = useState<Category[]>([]); // Added
  const [locations, setLocations] = useState<Location[]>([]); // Added
  const [loading, setLoading] = useState(true); // Tracks initial auth check
  const [profileLoading, setProfileLoading] = useState(true); // Tracks profile fetch
  const [usersLoading, setUsersLoading] = useState(true); // Added
  const [categoriesLoading, setCategoriesLoading] = useState(true); // Added
  const [locationsLoading, setLocationsLoading] = useState(true); // Added
  // const [authStateListenerFired, setAuthStateListenerFired] = useState(false); // REMOVED state
  const { toast } = useToast();

  // Reusable function to fetch profile and update state - wrapped in useCallback
  // Returns true if profile was set or created, false otherwise
  const fetchAndSetUserProfile = useCallback(async (user: FirebaseAuthUser | null): Promise<boolean> => {
    // console.log("fetchAndSetUserProfile: Called with user:", user?.uid);
    if (!user) {
      // console.log("fetchAndSetUserProfile: No user provided, resetting profile.");
      setUserProfile(null);
      setProfileLoading(false);
      return false; // Indicate no profile set
    }

    // Avoid fetching if profile *state* already matches this user's UID
    // Avoid fetching if profile *state* already matches this user's UID
    if (userProfile?.id === user.uid) {
      // console.log("fetchAndSetUserProfile: Profile already exists in state for user:", user.uid);
      setProfileLoading(false); // Still ensure profile loading is false
      return true; // Indicate profile exists
    }

    // console.log("fetchAndSetUserProfile: Starting profile fetch/create for user:", user.uid);
    setProfileLoading(true); // Set profile loading true
    let profileSet = false; // Track if profile was successfully set/created

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      // console.log("fetchAndSetUserProfile: Firestore doc fetched for user:", user.uid, "Exists:", userDoc.exists());

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // console.log("fetchAndSetUserProfile: User doc exists, data:", userData);

        // Verify document ID matches Firebase UID (redundant check, but safe)
        // if (userDoc.id !== user.uid) { ... } // Removed for brevity, Firestore ensures this

        const profileDataToSet: FirestoreUserProfile = {
          id: user.uid,
          email: userData.email || user.email || 'unknown@example.com',
          username: userData.username || user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: userData.photoURL || user.photoURL || undefined
        };
        // console.log("fetchAndSetUserProfile: Profile data constructed:", profileDataToSet);

        // Check if Firestore photoURL needs updating from Firebase Auth
        if ((!userData.photoURL || userData.photoURL === '') && user.photoURL) {
          // console.log("fetchAndSetUserProfile: Updating Firestore photoURL for user:", user.uid);
          try {
            await updateDoc(userDocRef, { photoURL: user.photoURL });
            profileDataToSet.photoURL = user.photoURL; // Update local object too
            // console.log("fetchAndSetUserProfile: Firestore photoURL updated successfully.");
          } catch (updateError) {
            console.error("fetchAndSetUserProfile: Error updating photoURL in Firestore:", updateError);
          }
        }

        setUserProfile(profileDataToSet);
        profileSet = true; // Mark profile as set
        // console.log("fetchAndSetUserProfile: User profile state updated for existing user:", user.uid);
      } else {
        // console.log("fetchAndSetUserProfile: User doc does not exist, creating profile for user:", user.uid);
        // User document doesn't exist - Create the profile.

        const newUserProfile: FirestoreUserProfile = {
          id: user.uid,
          email: user.email || 'unknown@example.com',
          username: user.displayName || user.email?.split('@')[0] || 'New User',
          photoURL: user.photoURL || undefined,
        };
        // console.log("fetchAndSetUserProfile: New profile data constructed:", newUserProfile);

        try {
          const newUserDocRef = doc(db, "users", user.uid);
          await setDoc(newUserDocRef, {
            email: newUserProfile.email,
            username: newUserProfile.username,
            photoURL: newUserProfile.photoURL,
          });
          setUserProfile(newUserProfile);
          profileSet = true; // Mark profile as created and set
          // console.log("fetchAndSetUserProfile: New user profile created and state updated for user:", user.uid);
        } catch (createError) {
          console.error("fetchAndSetUserProfile: Error creating new user profile:", createError);
          toast({
            title: "Setup Error",
            description: "Could not create your user profile. Please try again.",
            variant: "destructive"
          });
          // Attempt to sign out if profile creation fails to avoid inconsistent state
          try {
            await auth.signOut();
          } catch (signOutError) {
            console.error("fetchAndSetUserProfile: Error signing out after profile creation failure:", signOutError);
          }
          setCurrentUser(null); // Ensure local state reflects sign-out
          setUserProfile(null);
          profileSet = false; // Explicitly mark as not set
        }
      }
    } catch (error) {
      console.error("fetchAndSetUserProfile: Error during profile fetch/create:", error);
      toast({
        title: "Profile Error",
        description: "Could not load your user profile.", // Changed message
        variant: "destructive"
      });
       // Attempt to sign out on general fetch/create error
       try {
        await auth.signOut();
      } catch (signOutError) {
        console.error("fetchAndSetUserProfile: Error signing out after profile fetch/create failure:", signOutError);
      }
      setCurrentUser(null);
      setUserProfile(null);
      profileSet = false; // Explicitly mark as not set
    } finally {
      setProfileLoading(false); // Profile fetch/create attempt is complete
      // console.log("fetchAndSetUserProfile: Finished for user:", user?.uid, "Profile Set:", profileSet);
    }
    return profileSet; // Return status
    // Dependencies for useCallback: Only toast is needed as userProfile check uses current state.
  }, [toast]); // REMOVED userProfile dependency to break potential loop

  // --- Fetch All Users ---
  const fetchAllUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const usersCol = collection(db, "users");
      const snapshot = await getDocs(usersCol);
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

  // --- Fetch Categories (Real-time) ---
  useEffect(() => {
    // Only fetch if a user is logged in
    if (!currentUser) {
      setCategories([]); // Clear categories if logged out
      setCategoriesLoading(false);
      return; // Stop if no user
    }

    setCategoriesLoading(true);
    const catCol = collection(db, "categories");
    const q = query(catCol, orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
      setCategories(fetchedCategories);
      setCategoriesLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
      setCategoriesLoading(false);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser, toast]); // Add currentUser dependency

  // --- Fetch Locations (Real-time) ---
  useEffect(() => {
    // Only fetch if a user is logged in
    if (!currentUser) {
      setLocations([]); // Clear locations if logged out
      setLocationsLoading(false);
      return; // Stop if no user
    }

    setLocationsLoading(true);
    const locCol = collection(db, "locations");
    const q = query(locCol, orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLocations = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Location));
      setLocations(fetchedLocations);
      setLocationsLoading(false);
    }, (error) => {
      console.error("Error fetching locations:", error);
      toast({ title: "Error", description: "Could not load locations.", variant: "destructive" });
      setLocationsLoading(false);
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser, toast]); // Add currentUser dependency


  // --- REMOVED Effect to handle Redirect Result on Mount ---
  // Relying solely on onAuthStateChanged now

  // --- Effect to listen for Auth State Changes (Handles initial load AND redirect result) ---
  useEffect(() => {
    // console.log("AuthProvider: Setting up onAuthStateChanged listener.");
    setLoading(true); // Ensure loading is true when the listener setup starts

    const unsubscribe = onAuthStateChanged(auth, async (user) => { // Make callback async
      // console.log("onAuthStateChanged: Auth state changed. User:", user?.uid);
      setCurrentUser(user); // Update the user state immediately
      setLoading(false); // <<< SET LOADING FALSE HERE - Auth check complete

      // Removed check for existing userProfile here.
      // fetchAndSetUserProfile already has an internal check (line ~72)
      // Let onAuthStateChanged be the single source of truth for triggering fetches.

      // Start specific loading states
      setProfileLoading(true);
      setUsersLoading(true);

      if (user) {
        // console.log("onAuthStateChanged: User detected. Fetching profile and users...");
        // Fetch the essential user profile first
        const profileFetched = await fetchAndSetUserProfile(user);
        // console.log("onAuthStateChanged: Profile fetch completed. Status:", profileFetched);

        // Loading state is now set earlier
        // console.log("onAuthStateChanged: Loading was set to false earlier (user profile processed).");

        // Fetch all users in the background (don't await here)
        fetchAllUsers().then(() => {
          // console.log("onAuthStateChanged: Background fetchAllUsers completed.");
        }).catch(error => {
           console.error("onAuthStateChanged: Background fetchAllUsers failed:", error);
           // Optionally show a non-blocking toast notification here
        });
        // Categories/Locations are handled by their own effects which depend on currentUser
      } else {
        // console.log("onAuthStateChanged: No user detected. Resetting state.");
        // Reset states if user logs out or is initially null
        setUserProfile(null);
        setAllUsers([]);
        setProfileLoading(false); // Reset specific loading flags
        setUsersLoading(false);
        // Categories/Locations effects will clear their state due to currentUser being null

        // Loading state is now set earlier
        // console.log("onAuthStateChanged: Loading was set to false earlier (no user).");
      }
    });

    // Cleanup function
    return () => {
      // console.log("AuthProvider: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    };
    // Dependencies: None needed, listener should run once on mount.
  // Dependencies: fetchAndSetUserProfile and fetchAllUsers are needed.
  }, [fetchAndSetUserProfile, fetchAllUsers]);

  // --- REMOVED separate effect reacting to currentUser ---


  // The main 'loading' state is now managed entirely within the onAuthStateChanged effect.

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    currentUser,
    userProfile,
    allUsers,
    categories,
    locations,
    loading, // Use the simpler loading state managed by onAuthStateChanged effect
    profileLoading,
    usersLoading,
    categoriesLoading,
    locationsLoading,
  // List all state variables provided in the context value as dependencies
  }), [
      currentUser, userProfile, allUsers, categories, locations,
      loading, profileLoading, usersLoading, categoriesLoading, locationsLoading
  ]);

  // Render children directly. Loading state is handled by ProtectedRoute.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
