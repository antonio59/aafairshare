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
  WithFieldValue,
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

// Collection references with proper typing
let expensesRef: CollectionReference<FirestoreExpense>;
let categoriesRef: CollectionReference<Category>;
let categoryGroupsRef: CollectionReference<CategoryGroup>;
let tagsRef: CollectionReference<Tag>;
let budgetsRef: CollectionReference<Budget>;
let recurringExpensesRef: CollectionReference<FirestoreRecurringExpense>;
let settlementsRef: CollectionReference<FirestoreSettlement>;

// Initialize collection references after authentication
const initializeCollections = () => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to initialize collections');
  }
  expensesRef = collection(db, 'expenses') as CollectionReference<FirestoreExpense>;
  categoriesRef = collection(db, 'categories') as CollectionReference<Category>;
  categoryGroupsRef = collection(db, 'categoryGroups') as CollectionReference<CategoryGroup>;
  tagsRef = collection(db, 'tags') as CollectionReference<Tag>;
  budgetsRef = collection(db, 'budgets') as CollectionReference<Budget>;
  recurringExpensesRef = collection(db, 'recurringExpenses') as CollectionReference<FirestoreRecurringExpense>;
  settlementsRef = collection(db, 'settlements') as CollectionReference<FirestoreSettlement>;
};

// Helper function to convert date string to Firestore Timestamp
const dateToTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr));

// Helper function to convert Firestore Timestamp to ISO string
const timestampToString = (timestamp: Timestamp) => timestamp.toDate().toISOString();

// Helper function to safely cast document data
function getDocData<T>(doc: QueryDocumentSnapshot<T>): T {
  return doc.data();
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry operations
const withRetry = async <T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof FirebaseError || error instanceof FirestoreError) {
      if (error.code === 'unavailable' && retries > 0) {
        await delay(RETRY_DELAY);
        return withRetry(operation, retries - 1);
      }
    }
    throw error;
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

// Network status management
let isOffline = false;

export const goOffline = async () => {
  if (!isOffline) {
    await disableNetwork(db);
    isOffline = true;
  }
};

export const goOnline = async () => {
  if (isOffline) {
    await enableNetwork(db);
    isOffline = false;
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
    // Initialize collections if not already done
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to fetch data');
    }
    
    if (!expensesRef) {
      initializeCollections();
    }

    return await withRetry(async () => {
      const expenses = await getDocs(expensesRef);
      const categories = await getDocs(categoriesRef);
      const categoryGroups = await getDocs(categoryGroupsRef);
      const tags = await getDocs(tagsRef);
      const budgets = await getDocs(budgetsRef);
      const recurringExpenses = await getDocs(recurringExpensesRef);
      const settlements = await getDocs(settlementsRef);

      // Deduplicate categories based on id and name
      const uniqueCategories = Array.from(
        new Map(
          categories.docs.map(doc => {
            const data = getDocData(doc);
            return [`${data.id}-${data.name}`, data];
          })
        ).values()
      );

      // Deduplicate tags based on name (case-insensitive)
      const uniqueTags = Array.from(
        new Map(
          tags.docs.map(doc => {
            const data = getDocData(doc);
            return [data.name.toLowerCase(), data];
          })
        ).values()
      );

      return {
        expenses: expenses.docs.map(doc => {
          const data = getDocData(doc);
          return {
            ...data,
            date: timestampToString(data.date)
          };
        }),
        categories: uniqueCategories,
        categoryGroups: categoryGroups.docs.map(doc => getDocData(doc)),
        tags: uniqueTags,
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
    if (error instanceof FirebaseError && error.code === 'unavailable') {
      // If offline, try to work with cached data
      await goOffline();
      return fetchAllData();
    }
    return handleFirestoreError(error, 'fetch all data');
  }
};
