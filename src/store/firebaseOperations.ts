import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  updateDoc,
  Timestamp,
  enableIndexedDbPersistence,
  FirestoreError
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../firebase';
import type { Expense, Category, Tag, Budget, RecurringExpense, Settlement } from '../types';

// Collection references
const expensesRef = collection(db, 'expenses');
const categoriesRef = collection(db, 'categories');
const tagsRef = collection(db, 'tags');
const budgetsRef = collection(db, 'budgets');
const recurringExpensesRef = collection(db, 'recurringExpenses');
const settlementsRef = collection(db, 'settlements');

// Helper function to convert date string to Firestore Timestamp
const dateToTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr));

// Helper function to convert Firestore Timestamp to ISO string
const timestampToString = (timestamp: Timestamp) => timestamp.toDate().toISOString();

// Helper function to handle Firestore errors
const handleFirestoreError = (error: unknown, operation: string): never => {
  console.error(`Error in ${operation}:`, error);
  
  if (error instanceof FirebaseError || error instanceof FirestoreError) {
    switch (error.code) {
      case 'permission-denied':
        throw new Error('Permission denied. Please check your access rights.');
      case 'unavailable':
        throw new Error('Service temporarily unavailable. Please try again later.');
      case 'not-found':
        throw new Error('Requested document not found.');
      case 'already-exists':
        throw new Error('Document already exists.');
      default:
        throw new Error(`Firebase operation failed: ${error.message}`);
    }
  }
  
  if (error instanceof Error) {
    throw new Error(`Operation failed: ${error.message}`);
  }
  
  throw new Error(`Unknown error occurred during ${operation}`);
};

// Initialize Firestore with offline persistence
try {
  enableIndexedDbPersistence(db).catch((err: FirestoreError) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
} catch (error) {
  if (error instanceof Error) {
    console.warn('Failed to enable persistence:', error.message);
  }
}

// Expenses
export const addExpenseToFirestore = async (expense: Expense) => {
  try {
    const docRef = doc(expensesRef, expense.id);
    const firestoreExpense = {
      ...expense,
      date: dateToTimestamp(expense.date)
    };
    await setDoc(docRef, firestoreExpense);
  } catch (error) {
    handleFirestoreError(error, 'add expense');
  }
};

export const updateExpenseInFirestore = async (id: string, expense: Partial<Expense>) => {
  try {
    const docRef = doc(expensesRef, id);
    const firestoreExpense = {
      ...expense,
      date: expense.date ? dateToTimestamp(expense.date) : undefined
    };
    await updateDoc(docRef, firestoreExpense);
  } catch (error) {
    handleFirestoreError(error, 'update expense');
  }
};

export const deleteExpenseFromFirestore = async (id: string) => {
  try {
    const docRef = doc(expensesRef, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete expense');
  }
};

// Categories
export const addCategoryToFirestore = async (category: Category) => {
  try {
    const docRef = doc(categoriesRef, category.id);
    await setDoc(docRef, category);
  } catch (error) {
    handleFirestoreError(error, 'add category');
  }
};

export const updateCategoryInFirestore = async (id: string, category: Partial<Category>) => {
  try {
    const docRef = doc(categoriesRef, id);
    await updateDoc(docRef, category);
  } catch (error) {
    handleFirestoreError(error, 'update category');
  }
};

export const deleteCategoryFromFirestore = async (id: string) => {
  try {
    const docRef = doc(categoriesRef, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete category');
  }
};

// Tags
export const addTagToFirestore = async (tag: Tag) => {
  try {
    const docRef = doc(tagsRef, tag.id);
    await setDoc(docRef, tag);
  } catch (error) {
    handleFirestoreError(error, 'add tag');
  }
};

export const updateTagInFirestore = async (id: string, tag: Partial<Tag>) => {
  try {
    const docRef = doc(tagsRef, id);
    await updateDoc(docRef, tag);
  } catch (error) {
    handleFirestoreError(error, 'update tag');
  }
};

export const deleteTagFromFirestore = async (id: string) => {
  try {
    const docRef = doc(tagsRef, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete tag');
  }
};

// Budgets
export const addBudgetToFirestore = async (budget: Budget) => {
  try {
    const docRef = doc(budgetsRef, budget.id);
    await setDoc(docRef, budget);
  } catch (error) {
    handleFirestoreError(error, 'add budget');
  }
};

export const updateBudgetInFirestore = async (id: string, budget: Partial<Budget>) => {
  try {
    const docRef = doc(budgetsRef, id);
    await updateDoc(docRef, budget);
  } catch (error) {
    handleFirestoreError(error, 'update budget');
  }
};

export const deleteBudgetFromFirestore = async (id: string) => {
  try {
    const docRef = doc(budgetsRef, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete budget');
  }
};

// Recurring Expenses
export const addRecurringExpenseToFirestore = async (expense: RecurringExpense) => {
  try {
    const docRef = doc(recurringExpensesRef, expense.id);
    const firestoreExpense = {
      ...expense,
      lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : null
    };
    await setDoc(docRef, firestoreExpense);
  } catch (error) {
    handleFirestoreError(error, 'add recurring expense');
  }
};

export const updateRecurringExpenseInFirestore = async (id: string, expense: Partial<RecurringExpense>) => {
  try {
    const docRef = doc(recurringExpensesRef, id);
    const firestoreExpense = {
      ...expense,
      lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : undefined
    };
    await updateDoc(docRef, firestoreExpense);
  } catch (error) {
    handleFirestoreError(error, 'update recurring expense');
  }
};

export const deleteRecurringExpenseFromFirestore = async (id: string) => {
  try {
    const docRef = doc(recurringExpensesRef, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete recurring expense');
  }
};

// Settlements
export const addSettlementToFirestore = async (settlement: Settlement) => {
  try {
    const docRef = doc(settlementsRef, settlement.month);
    const firestoreSettlement = {
      ...settlement,
      settledAt: dateToTimestamp(settlement.settledAt)
    };
    await setDoc(docRef, firestoreSettlement);
  } catch (error) {
    handleFirestoreError(error, 'add settlement');
  }
};

// Fetch all data
export const fetchAllData = async () => {
  try {
    const expenses = await getDocs(expensesRef);
    const categories = await getDocs(categoriesRef);
    const tags = await getDocs(tagsRef);
    const budgets = await getDocs(budgetsRef);
    const recurringExpenses = await getDocs(recurringExpensesRef);
    const settlements = await getDocs(settlementsRef);

    return {
      expenses: expenses.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          date: timestampToString(data.date as Timestamp)
        } as Expense;
      }),
      categories: categories.docs.map(doc => doc.data() as Category),
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
  } catch (error) {
    handleFirestoreError(error, 'fetch all data');
  }
};
