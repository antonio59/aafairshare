import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'; // Added useCallback
// Removed unused AuthError import
import { onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth'; // Removed getRedirectResult
import { auth, db } from '@/lib/firebase'; // Removed authPersistencePromise
// Removed unused collection, query, where, getDocs, limit, addDoc, serverTimestamp imports
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Import updateDoc
import { useToast } from '@/hooks/use-toast';
import { User as FirestoreUserProfile } from '@shared/schema';

// Context Type
interface AuthContextType {
  currentUser: FirebaseAuthUser | null;
  userProfile: FirestoreUserProfile | null;
  loading: boolean; // Tracks initial auth check completion
  profileLoading: boolean; // Tracks if the profile fetch is in progress
  initialized: boolean; // Tracks if the initial auth check (onAuthStateChanged) has completed
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  profileLoading: true, // Initially true until first profile fetch attempt
  initialized: false,
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
  const [loading, setLoading] = useState(true); // Tracks initial auth check
  const [profileLoading, setProfileLoading] = useState(true); // Tracks profile fetch
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Reusable function to fetch profile and update state - wrapped in useCallback
  const fetchAndSetUserProfile = useCallback(async (user: FirebaseAuthUser | null) => {
    if (!user) {
      setUserProfile(null);
      setLoading(false); // Ensure loading is false if no user
      setProfileLoading(false); // Ensure profile loading is false if no user
      setInitialized(true);
      return;
    }

    // Avoid fetching if profile already exists for this user
    // Check userProfile state directly
    if (userProfile?.id === user.uid) {
      setLoading(false); // Ensure loading is false
      setProfileLoading(false); // Ensure profile loading is false
      setInitialized(true);
      return;
    }

    setProfileLoading(true); // Set profile loading true

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      // Removed leftover console.log arguments

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Removed leftover console.log arguments

        // Verify document ID matches Firebase UID
        if (userDoc.id !== user.uid) {
          console.error('User ID mismatch:', userDoc.id, user.uid);
          throw new Error('User authentication mismatch');
        }

        const profileDataToSet: FirestoreUserProfile = {
          id: user.uid, // Use Firebase UID as document ID
          email: userData.email || user.email || 'unknown@example.com',
          username: userData.username || user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: userData.photoURL || user.photoURL || undefined // Add photoURL
        };

        // --- Add this update logic ---
        // Check if Firestore photoURL is missing/empty but Firebase Auth has one
        if ((!userData.photoURL || userData.photoURL === '') && user.photoURL) {
          try {
            await updateDoc(userDocRef, { photoURL: user.photoURL });
            // Update the local profile state immediately as well
            profileDataToSet.photoURL = user.photoURL;
          } catch (updateError) {
            console.error("fetchAndSetUserProfile: Error updating photoURL in Firestore:", updateError);
            // Proceed without the updated URL, but log the error
          }
        }
        // --- End of update logic ---

        setUserProfile(profileDataToSet);
      } else {
        // User document doesn't exist - This is likely a first-time sign-in. Create the profile.

        const newUserProfile: FirestoreUserProfile = {
          id: user.uid,
          email: user.email || 'unknown@example.com',
          username: user.displayName || user.email?.split('@')[0] || 'New User',
          photoURL: user.photoURL || undefined,
          // Add any other default fields needed for a new user profile here
          // e.g., createdAt: serverTimestamp()
        };

        try {
          const newUserDocRef = doc(db, "users", user.uid);
          await setDoc(newUserDocRef, {
            // Explicitly set fields, avoid spreading the whole object if it contains 'id'
            email: newUserProfile.email,
            username: newUserProfile.username,
            photoURL: newUserProfile.photoURL,
            // createdAt: serverTimestamp() // Uncomment if you add this field
          });
          setUserProfile(newUserProfile); // Set the profile state
        } catch (createError) {
          console.error("fetchAndSetUserProfile: Error creating new user profile:", createError);
          toast({
            title: "Setup Error",
            description: "Could not create your user profile. Please try again.",
            variant: "destructive"
          });
          // Sign out if profile creation fails
          await auth.signOut();
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error("fetchAndSetUserProfile: Error during profile fetch/create:", error);
      toast({
        title: "Profile Error",
        description: "Could not verify authorization.",
        variant: "destructive"
      });
      await auth.signOut();
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
      setProfileLoading(false); // Set profile loading false
      // setLoading and setInitialized are handled by the caller (onAuthStateChanged effect)
    }
    // Dependencies for useCallback: userProfile state and toast function
  }, [userProfile, toast]);


  // Main useEffect using onAuthStateChanged
  useEffect(() => {
    setLoading(true); // Start loading

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user); // Update currentUser immediately

      if (user) {
        // Don't set loading false here, let fetchAndSetUserProfile handle it via profileLoading
        await fetchAndSetUserProfile(user);
      } else {
        setUserProfile(null);
        setProfileLoading(false); // No profile to load
        setLoading(false); // Auth check complete, no user
      }
      // Mark initialized once the first auth state is known (user or null)
      setInitialized(true);
    });

    return () => {
      unsubscribe();
    };
    // Added fetchAndSetUserProfile to dependency array
  }, [fetchAndSetUserProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading, // Add profileLoading to context value
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
