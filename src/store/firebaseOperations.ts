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
  QueryDocumentSnapshot,
  CollectionReference
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth } from '../firebase';
import { db } from '../firebase';
import type { Expense, Category, CategoryGroup, Tag, Budget, RecurringExpense, Settlement } from '../types';
import { v4 as uuidv4 } from 'uuid';
import type { DocumentData } from 'firebase/firestore';

// Firestore Data interface
export interface FirestoreData {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  budgets: Budget[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
}

// Collection references with proper typing
let expensesRef: CollectionReference<DocumentData>;
let categoriesRef: CollectionReference<DocumentData>;
let categoryGroupsRef: CollectionReference<DocumentData>;
let tagsRef: CollectionReference<DocumentData>;
let budgetsRef: CollectionReference<DocumentData>;
let recurringExpensesRef: CollectionReference<DocumentData>;
let settlementsRef: CollectionReference<DocumentData>;

// Initialize collection references
const initializeCollections = () => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Initialize collections with user-specific paths
  expensesRef = collection(db, `users/${userId}/expenses`);
  categoriesRef = collection(db, `users/${userId}/categories`);
  categoryGroupsRef = collection(db, `users/${userId}/categoryGroups`);
  tagsRef = collection(db, `users/${userId}/tags`);
  budgetsRef = collection(db, `users/${userId}/budgets`);
  recurringExpensesRef = collection(db, `users/${userId}/recurringExpenses`);
  settlementsRef = collection(db, `users/${userId}/settlements`);
};

// Helper functions
const dateToTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr));
const timestampToString = (timestamp: Timestamp) => timestamp.toDate().toISOString();

// Safe data conversion functions
const safeTimestampToString = (timestamp: any): string | null => {
  try {
    return timestamp instanceof Timestamp ? timestampToString(timestamp) : null;
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return null;
  }
};

const safeDocumentData = (doc: QueryDocumentSnapshot<DocumentData>) => {
  try {
    return doc.data();
  } catch (error) {
    console.error('Error getting document data:', error);
    return null;
  }
};

// Validation functions
const validateRecurringExpense = (data: any): boolean => {
  return (
    data !== null &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.amount === 'number' &&
    typeof data.category === 'string' &&
    typeof data.paidBy === 'string' &&
    (data.split === 'equal' || data.split === 'no-split') &&
    typeof data.startDate === 'string' &&
    (data.frequency === 'monthly' || data.frequency === 'quarterly' || data.frequency === 'yearly') &&
    typeof data.dayOfMonth === 'number' &&
    Array.isArray(data.tags)
  );
};

// CRUD Operations for Category Groups
export const addCategoryGroupToFirestore = async (group: Omit<CategoryGroup, 'id'>) => {
  initializeCollections();
  const id = uuidv4();
  const docRef = doc(categoryGroupsRef, id);
  const groupWithTimestamps = {
    ...group,
    id,
    createdAt: dateToTimestamp(group.createdAt),
    updatedAt: dateToTimestamp(group.updatedAt)
  };
  await setDoc(docRef, groupWithTimestamps);
};

export const updateCategoryGroupInFirestore = async (id: string, group: Partial<CategoryGroup>) => {
  initializeCollections();
  const docRef = doc(categoryGroupsRef, id);
  const updateData = {
    ...group,
    updatedAt: group.updatedAt ? dateToTimestamp(group.updatedAt) : undefined
  };
  await updateDoc(docRef, updateData);
};

export const deleteCategoryGroupFromFirestore = async (id: string) => {
  initializeCollections();
  const docRef = doc(categoryGroupsRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Categories
export const addCategoryToFirestore = async (category: Category) => {
  initializeCollections();
  const docRef = doc(categoriesRef, category.id);
  await setDoc(docRef, category);
};

export const updateCategoryInFirestore = async (id: string, category: Partial<Category>) => {
  initializeCollections();
  const docRef = doc(categoriesRef, id);
  await updateDoc(docRef, category);
};

export const deleteCategoryFromFirestore = async (id: string) => {
  initializeCollections();
  const docRef = doc(categoriesRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Tags
export const addTagToFirestore = async (tag: Tag) => {
  initializeCollections();
  const docRef = doc(tagsRef, tag.id);
  await setDoc(docRef, tag);
};

export const updateTagInFirestore = async (id: string, tag: Partial<Tag>) => {
  initializeCollections();
  const docRef = doc(tagsRef, id);
  await updateDoc(docRef, tag);
};

export const deleteTagFromFirestore = async (id: string) => {
  initializeCollections();
  const docRef = doc(tagsRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Budgets
export const addBudgetToFirestore = async (budget: Budget) => {
  initializeCollections();
  const docRef = doc(budgetsRef, budget.id);
  await setDoc(docRef, budget);
};

export const updateBudgetInFirestore = async (id: string, budget: Partial<Budget>) => {
  initializeCollections();
  const docRef = doc(budgetsRef, id);
  await updateDoc(docRef, budget);
};

export const deleteBudgetFromFirestore = async (id: string) => {
  initializeCollections();
  const docRef = doc(budgetsRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Recurring Expenses
export const addRecurringExpenseToFirestore = async (expense: RecurringExpense) => {
  initializeCollections();
  const docRef = doc(recurringExpensesRef, expense.id);
  await setDoc(docRef, {
    ...expense,
    lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : null
  });
};

export const updateRecurringExpenseInFirestore = async (id: string, expense: Partial<RecurringExpense>) => {
  initializeCollections();
  const docRef = doc(recurringExpensesRef, id);
  const updateData = {
    ...expense,
    lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : undefined
  };
  await updateDoc(docRef, updateData);
};

export const deleteRecurringExpenseFromFirestore = async (id: string) => {
  initializeCollections();
  const docRef = doc(recurringExpensesRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Expenses
export const addExpenseToFirestore = async (expense: Expense) => {
  initializeCollections();
  const docRef = doc(expensesRef, expense.id);
  await setDoc(docRef, {
    ...expense,
    date: dateToTimestamp(expense.date)
  });
};

export const updateExpenseInFirestore = async (id: string, expense: Partial<Expense>) => {
  initializeCollections();
  const docRef = doc(expensesRef, id);
  const updateData = {
    ...expense,
    date: expense.date ? dateToTimestamp(expense.date) : undefined
  };
  await updateDoc(docRef, updateData);
};

export const deleteExpenseFromFirestore = async (id: string) => {
  initializeCollections();
  const docRef = doc(expensesRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Settlements
export const addSettlementToFirestore = async (settlement: Settlement) => {
  initializeCollections();
  const docRef = doc(settlementsRef, settlement.month);
  await setDoc(docRef, {
    ...settlement,
    settledAt: dateToTimestamp(settlement.settledAt)
  });
};

// Fetch all data with improved error handling and data validation
export const fetchAllData = async (): Promise<FirestoreData> => {
  try {
    // Initialize collections with current user context
    initializeCollections();

    // Fetch all collections in parallel with error handling
    const [
      expensesSnapshot,
      categoriesSnapshot,
      categoryGroupsSnapshot,
      tagsSnapshot,
      budgetsSnapshot,
      recurringExpensesSnapshot,
      settlementsSnapshot
    ] = await Promise.all([
      getDocs(expensesRef),
      getDocs(categoriesRef),
      getDocs(categoryGroupsRef),
      getDocs(tagsRef),
      getDocs(budgetsRef),
      getDocs(recurringExpensesRef),
      getDocs(settlementsRef)
    ]);

    // Process expenses with validation
    const expenses = expensesSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data || !data.date) return null;
        return {
          ...data,
          id: doc.id,
          date: safeTimestampToString(data.date) || new Date().toISOString()
        };
      })
      .filter((expense): expense is Expense => expense !== null);

    // Process category groups with validation
    const categoryGroups = categoryGroupsSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data) return null;
        return {
          ...data,
          id: doc.id,
          createdAt: safeTimestampToString(data.createdAt) || new Date().toISOString(),
          updatedAt: safeTimestampToString(data.updatedAt) || new Date().toISOString()
        };
      })
      .filter((group): group is CategoryGroup => group !== null);

    // Process other collections
    const categories = categoriesSnapshot.docs
      .map(doc => ({ ...safeDocumentData(doc), id: doc.id }))
      .filter((category): category is Category => category !== null);

    const tags = tagsSnapshot.docs
      .map(doc => ({ ...safeDocumentData(doc), id: doc.id }))
      .filter((tag): tag is Tag => tag !== null);

    const budgets = budgetsSnapshot.docs
      .map(doc => ({ ...safeDocumentData(doc), id: doc.id }))
      .filter((budget): budget is Budget => budget !== null);

    // Process recurring expenses with validation
    const recurringExpenses = recurringExpensesSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data) return null;

        const processedData = {
          ...data,
          id: doc.id,
          lastProcessed: data.lastProcessed ? safeTimestampToString(data.lastProcessed) : undefined
        };

        return validateRecurringExpense(processedData) ? processedData as RecurringExpense : null;
      })
      .filter((expense): expense is RecurringExpense => expense !== null);

    const settlements = settlementsSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data) return null;
        return {
          ...data,
          settledAt: safeTimestampToString(data.settledAt) || new Date().toISOString()
        };
      })
      .filter((settlement): settlement is Settlement => settlement !== null);

    return {
      expenses,
      categories,
      categoryGroups,
      tags,
      budgets,
      recurringExpenses,
      settlements
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
