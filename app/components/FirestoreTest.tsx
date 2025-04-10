import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { db } from '~/lib/firebase';

export function FirestoreTest() {
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking...');
  const [collectionStatus, setCollectionStatus] = useState<string>('Not tested');
  const [documentStatus, setDocumentStatus] = useState<string>('Not tested');

  useEffect(() => {
    // Check if Firestore is available
    if (db && typeof db.collection === 'function') {
      setFirestoreStatus('Available');
    } else {
      setFirestoreStatus('Not available');
    }
  }, []);

  const testCollection = async () => {
    setCollectionStatus('Testing...');
    try {
      // Test accessing a collection
      if (!db || typeof db.collection !== 'function') {
        throw new Error('Firestore db is not properly initialized');
      }
      
      // Try to access the users collection
      const usersCollection = db.collection('users');
      console.log('Users collection reference:', usersCollection);
      
      // Try to get documents from the collection
      const snapshot = await usersCollection.limit(1).get();
      console.log('Collection snapshot:', snapshot);
      console.log('Empty?', snapshot.empty);
      console.log('Size:', snapshot.size);
      
      setCollectionStatus('Success');
    } catch (error) {
      console.error('Test collection error:', error);
      setCollectionStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testDocument = async () => {
    setDocumentStatus('Testing...');
    try {
      // Test accessing a document
      if (!db || typeof db.doc !== 'function') {
        throw new Error('Firestore db is not properly initialized');
      }
      
      // Try to access a test document
      const testDoc = db.doc('test/test-document');
      console.log('Test document reference:', testDoc);
      
      // Try to set data to the document
      await testDoc.set({
        testField: 'test value',
        timestamp: new Date()
      });
      
      // Try to get the document
      const docSnapshot = await testDoc.get();
      console.log('Document exists?', docSnapshot.exists);
      console.log('Document data:', docSnapshot.data());
      
      setDocumentStatus('Success');
    } catch (error) {
      console.error('Test document error:', error);
      setDocumentStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Firestore Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Firestore:</div>
          <div className={firestoreStatus === 'Available' ? 'text-green-600' : 'text-red-600'}>
            {firestoreStatus}
          </div>
          
          <div className="font-medium">Collection Test:</div>
          <div className={
            collectionStatus === 'Success' ? 'text-green-600' : 
            collectionStatus === 'Testing...' ? 'text-blue-600' :
            collectionStatus === 'Not tested' ? 'text-gray-600' : 'text-red-600'
          }>
            {collectionStatus}
          </div>
          
          <div className="font-medium">Document Test:</div>
          <div className={
            documentStatus === 'Success' ? 'text-green-600' : 
            documentStatus === 'Testing...' ? 'text-blue-600' :
            documentStatus === 'Not tested' ? 'text-gray-600' : 'text-red-600'
          }>
            {documentStatus}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            onClick={testCollection} 
            disabled={firestoreStatus !== 'Available'}
            className="w-full"
          >
            Test Collection
          </Button>
          
          <Button 
            onClick={testDocument} 
            disabled={firestoreStatus !== 'Available'}
            className="w-full"
          >
            Test Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
