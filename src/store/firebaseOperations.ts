import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  updateDoc,
  Timestamp,
  FirestoreError,
  enableNetwork,
  disableNetwork,
  getFirestore,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase';
import { db } from '../firebase';
import type { Expense, Category, CategoryGroup, Tag, Budget, RecurringExpense, Settlement } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Firestore document types
interface FirestoreExpense extends Omit<Expense, 'date'> {
  date: Timestamp;
}

interface FirestoreRecurringExpense extends Omit<RecurringExpense, 'lastProcessed'> {
  lastProcessed: Timestamp | null;
}

interface FirestoreSettlement extends Omit<Settlement, 'settledAt'> {
  settledAt: Timestamp;
}

// Helper functions for timestamp conversion
const dateToTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr));
const timestampToString = (timestamp: Timestamp) => timestamp.toDate().toISOString();

// Network status management
let isOffline = false;

const goOffline = async () => {
  if (!isOffline) {
    await disableNetwork(db);
    isOffline = true;
  }
};

const goOnline = async () => {
  if (isOffline) {
    await enableNetwork(db);
    isOffline = false;
  }
};

// Helper function to handle Firestore errors
const handleFirestoreError = (error: unknown, operation: string): Promise<never> => {
  console.error(`Error in ${operation}:`, error);
  
  if (error instanceof FirebaseError || error instanceof FirestoreError) {
    switch (error.code) {
      case 'permission-denied':
        return Promise.reject(new Error('You don\'t have permission to perform this action. Please check your access rights or log in again.'));
      case 'unavailable':
        return Promise.reject(new Error('Service is temporarily unavailable. We\'ll automatically retry when connectivity is restored.'));
      case 'not-found':
        return Promise.reject(new Error('The requested data could not be found. It may have been deleted or moved.'));
      case 'already-exists':
        return Promise.reject(new Error('This data already exists and cannot be duplicated.'));
      case 'failed-precondition':
        return Promise.reject(new Error('Operation cannot be performed in the current state. Please refresh the page.'));
      case 'unauthenticated':
        return Promise.reject(new Error('Your session has expired. Please log in again.'));
      case 'cancelled':
        return Promise.reject(new Error('Operation was cancelled. Please try again.'));
      case 'data-loss':
        return Promise.reject(new Error('Critical data error occurred. Please contact support.'));
      case 'deadline-exceeded':
        return Promise.reject(new Error('Operation timed out. Please check your connection and try again.'));
      case 'resource-exhausted':
        return Promise.reject(new Error('System temporarily overloaded. Please try again in a few minutes.'));
      default:
        return Promise.reject(new Error(`Operation failed: ${error.message}`));
    }
  }
  
  if (error instanceof Error) {
    return Promise.reject(new Error(`Operation failed: ${error.message}`));
  }
  
  return Promise.reject(new Error(`An unexpected error occurred during ${operation}. Please try again.`));
};

// Verify authentication and token
const verifyAuth = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const token = await user.getIdToken(true); // Force token refresh
    console.log('Token verified for user:', user.email);
    return token;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Failed to verify authentication token');
  }
};

// Collection references with proper typing
let expensesRef: CollectionReference<FirestoreExpense>;
let categoriesRef: CollectionReference<Category>;
let categoryGroupsRef: CollectionReference<CategoryGroup>;
let tagsRef: CollectionReference<Tag>;
let budgetsRef: CollectionReference<Budget>;
let recurringExpensesRef: CollectionReference<FirestoreRecurringExpense>;
let settlementsRef: CollectionReference<FirestoreSettlement>;

// Initialize collection references after authentication
const initializeCollections = async () => {
  await verifyAuth(); // Verify auth before initializing
  
  expensesRef = collection(db, 'expenses') as CollectionReference<FirestoreExpense>;
  categoriesRef = collection(db, 'categories') as CollectionReference<Category>;
  categoryGroupsRef = collection(db, 'categoryGroups') as CollectionReference<CategoryGroup>;
  tagsRef = collection(db, 'tags') as CollectionReference<Tag>;
  budgetsRef = collection(db, 'budgets') as CollectionReference<Budget>;
  recurringExpensesRef = collection(db, 'recurringExpenses') as CollectionReference<FirestoreRecurringExpense>;
  settlementsRef = collection(db, 'settlements') as CollectionReference<FirestoreSettlement>;
};

// Helper function to safely cast document data
function getDocData<T>(doc: QueryDocumentSnapshot<T>): T {
  return doc.data();
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry operations with token refresh
const withRetry = async <T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    // Verify auth before each operation
    await verifyAuth();
    return await operation();
  } catch (error) {
    if (error instanceof FirebaseError || error instanceof FirestoreError) {
      if (error.code === 'permission-denied') {
        if (retries > 0) {
          console.log('Permission denied, refreshing token and retrying...');
          await delay(RETRY_DELAY);
          return withRetry(operation, retries - 1);
        }
      }
      if (error.code === 'unavailable' && retries > 0) {
        await delay(RETRY_DELAY);
        return withRetry(operation, retries - 1);
      }
    }
    throw error;
  }
};

export interface FirestoreData {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
}

// Fetch all data with offline support
export const fetchAllData = async (): Promise<FirestoreData> => {
  try {
    // Verify auth and initialize collections
    await verifyAuth();
    
    if (!expensesRef) {
      await initializeCollections();
    }

    return await withRetry(async () => {
      console.log('Fetching data with verified token...');
      
      const expenses = await getDocs(expensesRef);
      const categories = await getDocs(categoriesRef);
      const categoryGroups = await getDocs(categoryGroupsRef);
      const tags = await getDocs(tagsRef);
      const budgets = await getDocs(budgetsRef);
      const recurringExpenses = await getDocs(recurringExpensesRef);
      const settlements = await getDocs(settlementsRef);

      console.log('Successfully fetched all collections');

      // Process and return data
      return {
        expenses: expenses.docs.map(doc => {
          const data = getDocData(doc);
          return {
            ...data,
            date: timestampToString(data.date)
          };
        }),
        categories: categories.docs.map(doc => getDocData(doc)),
        categoryGroups: categoryGroups.docs.map(doc => getDocData(doc)),
        tags: tags.docs.map(doc => getDocData(doc)),
        budgets: budgets.docs.map(doc => getDocData(doc)),
        recurringExpenses: recurringExpenses.docs.map(doc => {
          const data = getDocData(doc);
          return {
            ...data,
            lastProcessed: data.lastProcessed ? timestampToString(data.lastProcessed) : undefined
          };
        }),
        settlements: settlements.docs.map(doc => {
          const data = getDocData(doc);
          return {
            ...data,
            settledAt: timestampToString(data.settledAt)
          };
        })
      };
    });
  } catch (error) {
    console.error('Error in fetchAllData:', error);
    if (error instanceof FirebaseError && error.code === 'unavailable') {
      console.log('Service unavailable, attempting offline mode...');
      await goOffline();
      return fetchAllData();
    }
    return handleFirestoreError(error, 'fetch all data');
  }
};

// Export network management functions
export { goOffline, goOnline };
