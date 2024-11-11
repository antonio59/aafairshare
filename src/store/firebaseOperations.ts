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
  disableNetwork
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../firebase';
import type { Expense, Category, CategoryGroup, Tag, Budget, RecurringExpense, Settlement } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Collection references
const expensesRef = collection(db, 'expenses');
const categoriesRef = collection(db, 'categories');
const categoryGroupsRef = collection(db, 'categoryGroups');
const tagsRef = collection(db, 'tags');
const budgetsRef = collection(db, 'budgets');
const recurringExpensesRef = collection(db, 'recurringExpenses');
const settlementsRef = collection(db, 'settlements');

// Helper function to convert date string to Firestore Timestamp
const dateToTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr));

// Helper function to convert Firestore Timestamp to ISO string
const timestampToString = (timestamp: Timestamp) => timestamp.toDate().toISOString();

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

// Initialize default category groups
export const initializeDefaultCategoryGroups = async () => {
  const groups = [
    { name: "Clothing", order: 0 },
    { name: "Entertainment", order: 1 },
    { name: "Food", order: 2 },
    { name: "Health and Wellness", order: 3 },
    { name: "Housing", order: 4 },
    { name: "Insurance", order: 5 },
    { name: "Miscellaneous", order: 6 },
    { name: "Transportation", order: 7 },
    { name: "Utilities", order: 8 }
  ];

  try {
    for (const group of groups) {
      const id = uuidv4();
      const docRef = doc(categoryGroupsRef, id);
      await setDoc(docRef, { ...group, id });
      console.log('Added group:', group.name);
    }
  } catch (error) {
    return handleFirestoreError(error, 'initialize default category groups');
  }
};

// Expenses
export const addExpenseToFirestore = async (expense: Expense) => {
  try {
    await withRetry(async () => {
      const docRef = doc(expensesRef, expense.id);
      const firestoreExpense = {
        ...expense,
        date: dateToTimestamp(expense.date)
      };
      await setDoc(docRef, firestoreExpense);
    });
  } catch (error) {
    return handleFirestoreError(error, 'add expense');
  }
};

export const updateExpenseInFirestore = async (id: string, expense: Partial<Expense>) => {
  try {
    await withRetry(async () => {
      const docRef = doc(expensesRef, id);
      const firestoreExpense = {
        ...expense,
        date: expense.date ? dateToTimestamp(expense.date) : undefined
      };
      await updateDoc(docRef, firestoreExpense);
    });
  } catch (error) {
    return handleFirestoreError(error, 'update expense');
  }
};

export const deleteExpenseFromFirestore = async (id: string) => {
  try {
    await withRetry(async () => {
      const docRef = doc(expensesRef, id);
      await deleteDoc(docRef);
    });
  } catch (error) {
    return handleFirestoreError(error, 'delete expense');
  }
};

// Category Groups
export const addCategoryGroupToFirestore = async (group: CategoryGroup) => {
  try {
    await withRetry(async () => {
      const docRef = doc(categoryGroupsRef, group.id);
      await setDoc(docRef, group);
    });
  } catch (error) {
    return handleFirestoreError(error, 'add category group');
  }
};

export const updateCategoryGroupInFirestore = async (id: string, group: Partial<CategoryGroup>) => {
  try {
    await withRetry(async () => {
      const docRef = doc(categoryGroupsRef, id);
      await updateDoc(docRef, group);
    });
  } catch (error) {
    return handleFirestoreError(error, 'update category group');
  }
};

export const deleteCategoryGroupFromFirestore = async (id: string) => {
  try {
    await withRetry(async () => {
      const docRef = doc(categoryGroupsRef, id);
      await deleteDoc(docRef);
    });
  } catch (error) {
    return handleFirestoreError(error, 'delete category group');
  }
};

// Categories
export const addCategoryToFirestore = async (category: Category) => {
  try {
    await withRetry(async () => {
      const docRef = doc(categoriesRef, category.id);
      await setDoc(docRef, category);
    });
  } catch (error) {
    return handleFirestoreError(error, 'add category');
  }
};

export const updateCategoryInFirestore = async (id: string, category: Partial<Category>) => {
  try {
    await withRetry(async () => {
      const docRef = doc(categoriesRef, id);
      await updateDoc(docRef, category);
    });
  } catch (error) {
    return handleFirestoreError(error, 'update category');
  }
};

export const deleteCategoryFromFirestore = async (id: string) => {
  try {
    await withRetry(async () => {
      const docRef = doc(categoriesRef, id);
      await deleteDoc(docRef);
    });
  } catch (error) {
    return handleFirestoreError(error, 'delete category');
  }
};

// Tags
export const addTagToFirestore = async (tag: Tag) => {
  try {
    await withRetry(async () => {
      const docRef = doc(tagsRef, tag.id);
      await setDoc(docRef, tag);
    });
  } catch (error) {
    return handleFirestoreError(error, 'add tag');
  }
};

export const updateTagInFirestore = async (id: string, tag: Partial<Tag>) => {
  try {
    await withRetry(async () => {
      const docRef = doc(tagsRef, id);
      await updateDoc(docRef, tag);
    });
  } catch (error) {
    return handleFirestoreError(error, 'update tag');
  }
};

export const deleteTagFromFirestore = async (id: string) => {
  try {
    await withRetry(async () => {
      const docRef = doc(tagsRef, id);
      await deleteDoc(docRef);
    });
  } catch (error) {
    return handleFirestoreError(error, 'delete tag');
  }
};

// Budgets
export const addBudgetToFirestore = async (budget: Budget) => {
  try {
    await withRetry(async () => {
      const docRef = doc(budgetsRef, budget.id);
      await setDoc(docRef, budget);
    });
  } catch (error) {
    return handleFirestoreError(error, 'add budget');
  }
};

export const updateBudgetInFirestore = async (id: string, budget: Partial<Budget>) => {
  try {
    await withRetry(async () => {
      const docRef = doc(budgetsRef, id);
      await updateDoc(docRef, budget);
    });
  } catch (error) {
    return handleFirestoreError(error, 'update budget');
  }
};

export const deleteBudgetFromFirestore = async (id: string) => {
  try {
    await withRetry(async () => {
      const docRef = doc(budgetsRef, id);
      await deleteDoc(docRef);
    });
  } catch (error) {
    return handleFirestoreError(error, 'delete budget');
  }
};

// Recurring Expenses
export const addRecurringExpenseToFirestore = async (expense: RecurringExpense) => {
  try {
    await withRetry(async () => {
      const docRef = doc(recurringExpensesRef, expense.id);
      const firestoreExpense = {
        ...expense,
        lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : null
      };
      await setDoc(docRef, firestoreExpense);
    });
  } catch (error) {
    return handleFirestoreError(error, 'add recurring expense');
  }
};

export const updateRecurringExpenseInFirestore = async (id: string, expense: Partial<RecurringExpense>) => {
  try {
    await withRetry(async () => {
      const docRef = doc(recurringExpensesRef, id);
      const firestoreExpense = {
        ...expense,
        lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : undefined
      };
      await updateDoc(docRef, firestoreExpense);
    });
  } catch (error) {
    return handleFirestoreError(error, 'update recurring expense');
  }
};

export const deleteRecurringExpenseFromFirestore = async (id: string) => {
  try {
    await withRetry(async () => {
      const docRef = doc(recurringExpensesRef, id);
      await deleteDoc(docRef);
    });
  } catch (error) {
    return handleFirestoreError(error, 'delete recurring expense');
  }
};

// Settlements
export const addSettlementToFirestore = async (settlement: Settlement) => {
  try {
    await withRetry(async () => {
      const docRef = doc(settlementsRef, settlement.month);
      const firestoreSettlement = {
        ...settlement,
        settledAt: dateToTimestamp(settlement.settledAt)
      };
      await setDoc(docRef, firestoreSettlement);
    });
  } catch (error) {
    return handleFirestoreError(error, 'add settlement');
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
            const data = doc.data() as Category;
            return [`${data.id}-${data.name}`, data];
          })
        ).values()
      );

      return {
        expenses: expenses.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            date: timestampToString(data.date as Timestamp)
          } as Expense;
        }),
        categories: uniqueCategories,
        categoryGroups: categoryGroups.docs.map(doc => doc.data() as CategoryGroup),
        tags: tags.docs.map(doc => doc.data() as Tag),
        budgets: budgets.docs.map(doc => doc.data() as Budget),
        recurringExpenses: recurringExpenses.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            lastProcessed: data.lastProcessed ? timestampToString(data.lastProcessed as Timestamp) : null
          } as RecurringExpense;
        }),
        settlements: settlements.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            settledAt: timestampToString(data.settledAt as Timestamp)
          } as Settlement;
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
