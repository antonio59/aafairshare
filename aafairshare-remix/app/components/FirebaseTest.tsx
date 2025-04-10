import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export function FirebaseTest() {
  const [firebaseStatus, setFirebaseStatus] = useState<string>('Checking...');
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking...');
  const [signInStatus, setSignInStatus] = useState<string>('Not tested');

  useEffect(() => {
    // Check if Firebase is available
    if (typeof window !== 'undefined') {
      if (window.firebase) {
        setFirebaseStatus('Available');
        
        // Check if Firebase Auth is available
        if (typeof window.firebase.auth === 'function') {
          setAuthStatus('Available');
        } else {
          setAuthStatus('Not available');
        }
        
        // Check if Firebase Firestore is available
        if (typeof window.firebase.firestore === 'function') {
          setFirestoreStatus('Available');
        } else {
          setFirestoreStatus('Not available');
        }
      } else {
        setFirebaseStatus('Not available');
        setAuthStatus('Not available');
        setFirestoreStatus('Not available');
      }
    }
  }, []);

  const testSignIn = async () => {
    setSignInStatus('Testing...');
    try {
      if (typeof window === 'undefined' || !window.firebase) {
        throw new Error('Firebase is not available');
      }
      
      // Create a new auth instance directly
      const auth = window.firebase.auth();
      
      // Make sure signInWithPopup is available
      if (typeof auth.signInWithPopup !== 'function') {
        throw new Error('signInWithPopup is not a function on auth instance');
      }
      
      const provider = new window.firebase.auth.GoogleAuthProvider();
      
      // Attempt sign in
      await auth.signInWithPopup(provider);
      setSignInStatus('Success');
    } catch (error) {
      console.error('Test sign in error:', error);
      setSignInStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Firebase Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Firebase:</div>
          <div className={firebaseStatus === 'Available' ? 'text-green-600' : 'text-red-600'}>
            {firebaseStatus}
          </div>
          
          <div className="font-medium">Auth:</div>
          <div className={authStatus === 'Available' ? 'text-green-600' : 'text-red-600'}>
            {authStatus}
          </div>
          
          <div className="font-medium">Firestore:</div>
          <div className={firestoreStatus === 'Available' ? 'text-green-600' : 'text-red-600'}>
            {firestoreStatus}
          </div>
          
          <div className="font-medium">Sign In Test:</div>
          <div className={
            signInStatus === 'Success' ? 'text-green-600' : 
            signInStatus === 'Testing...' ? 'text-blue-600' :
            signInStatus === 'Not tested' ? 'text-gray-600' : 'text-red-600'
          }>
            {signInStatus}
          </div>
        </div>
        
        <Button 
          onClick={testSignIn} 
          disabled={firebaseStatus !== 'Available' || authStatus !== 'Available'}
          className="w-full mt-4"
        >
          Test Google Sign In
        </Button>
      </CardContent>
    </Card>
  );
}
