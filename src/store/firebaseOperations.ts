import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  updateDoc,
  Timestamp,
  QueryDocumentSnapshot,
  CollectionReference,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '@/firebase';
import type { 
  Expense, 
  Category, 
  CategoryGroup, 
  Tag, 
  Budget, 
  RecurringExpense, 
  Settlement,
  BudgetHistory
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import type { DocumentData } from 'firebase/firestore';

// Firestore Data interface
export interface FirestoreData {
  expenses: Expense[];
  categories: Category[];
  categoryGroups: CategoryGroup[];
  tags: Tag[];
  budgets: Budget[];
  budgetHistory: BudgetHistory[];
  recurringExpenses: RecurringExpense[];
  settlements: Settlement[];
}

// Collection references with proper typing
let expensesRef: CollectionReference<DocumentData>;
let categoriesRef: CollectionReference<DocumentData>;
let categoryGroupsRef: CollectionReference<DocumentData>;
let tagsRef: CollectionReference<DocumentData>;
let budgetsRef: CollectionReference<DocumentData>;
let budgetHistoryRef: CollectionReference<DocumentData>;
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
  budgetHistoryRef = collection(db, `users/${userId}/budgetHistory`);
  recurringExpensesRef = collection(db, `users/${userId}/recurringExpenses`);
  settlementsRef = collection(db, `users/${userId}/settlements`);
};

// Helper functions
const dateToTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr));
const timestampToString = (timestamp: Timestamp) => timestamp.toDate().toISOString();

// Safe data conversion functions
const safeTimestampToString = (timestamp: any): string | undefined => {
  try {
    return timestamp instanceof Timestamp ? timestampToString(timestamp) : undefined;
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return undefined;
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

// Budget History Operations
export const addBudgetHistoryToFirestore = async (history: BudgetHistory) => {
  initializeCollections();
  const docRef = doc(budgetHistoryRef, history.id);
  await setDoc(docRef, {
    ...history,
    timestamp: dateToTimestamp(history.timestamp)
  });
};

// CRUD Operations for Budgets with History Tracking
export const addBudgetToFirestore = async (budget: Budget) => {
  initializeCollections();
  const docRef = doc(budgetsRef, budget.id);
  await setDoc(docRef, budget);

  // Add to history
  const history: BudgetHistory = {
    id: uuidv4(),
    budgetId: budget.id,
    actionType: 'created',
    category: budget.category,
    newValue: budget.amount,
    timestamp: new Date().toISOString(),
    userId: auth.currentUser?.uid || '',
    userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown User'
  };
  await addBudgetHistoryToFirestore(history);
};

export const updateBudgetInFirestore = async (id: string, budget: Partial<Budget>) => {
  initializeCollections();
  const docRef = doc(budgetsRef, id);
  
  // Get current budget for comparison
  const docSnap = await getDoc(docRef);
  const currentBudget = docSnap.data() as Budget;
  await updateDoc(docRef, budget);

  // Add to history if amount changed
  if (budget.amount !== undefined && budget.amount !== currentBudget.amount) {
    const history: BudgetHistory = {
      id: uuidv4(),
      budgetId: id,
      actionType: budget.amount > currentBudget.amount ? 'increased' : 'decreased',
      category: currentBudget.category,
      oldValue: currentBudget.amount,
      newValue: budget.amount,
      timestamp: new Date().toISOString(),
      userId: auth.currentUser?.uid || '',
      userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown User'
    };
    await addBudgetHistoryToFirestore(history);
  }
};

export const deleteBudgetFromFirestore = async (id: string) => {
  initializeCollections();
  const docRef = doc(budgetsRef, id);
  
  // Get current budget for history
  const docSnap = await getDoc(docRef);
  const currentBudget = docSnap.data() as Budget;
  await deleteDoc(docRef);

  // Add to history
  const history: BudgetHistory = {
    id: uuidv4(),
    budgetId: id,
    actionType: 'deleted',
    category: currentBudget.category,
    oldValue: currentBudget.amount,
    timestamp: new Date().toISOString(),
    userId: auth.currentUser?.uid || '',
    userName: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown User'
  };
  await addBudgetHistoryToFirestore(history);
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

// CRUD Operations for Category Groups
export const addCategoryGroupToFirestore = async (group: CategoryGroup) => {
  initializeCollections();
  const docRef = doc(categoryGroupsRef, group.id);
  await setDoc(docRef, group);
};

export const updateCategoryGroupInFirestore = async (id: string, group: Partial<CategoryGroup>) => {
  initializeCollections();
  const docRef = doc(categoryGroupsRef, id);
  await updateDoc(docRef, group);
};

export const deleteCategoryGroupFromFirestore = async (id: string) => {
  initializeCollections();
  const docRef = doc(categoryGroupsRef, id);
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
    initializeCollections();

    const [
      expensesSnapshot,
      categoriesSnapshot,
      categoryGroupsSnapshot,
      tagsSnapshot,
      budgetsSnapshot,
      budgetHistorySnapshot,
      recurringExpensesSnapshot,
      settlementsSnapshot
    ] = await Promise.all([
      getDocs(expensesRef),
      getDocs(categoriesRef),
      getDocs(categoryGroupsRef),
      getDocs(tagsRef),
      getDocs(budgetsRef),
      getDocs(budgetHistoryRef),
      getDocs(recurringExpensesRef),
      getDocs(settlementsRef)
    ]);

    // Process expenses with validation
    const expenses = expensesSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data || !data.date) return null;
        const date = safeTimestampToString(data.date);
        if (!date) return null;
        return {
          ...data,
          id: doc.id,
          date
        };
      })
      .filter((expense): expense is Expense => expense !== null);

    // Process category groups with validation
    const categoryGroups = categoryGroupsSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data) return null;
        const createdAt = safeTimestampToString(data.createdAt);
        const updatedAt = safeTimestampToString(data.updatedAt);
        if (!createdAt || !updatedAt) return null;
        return {
          ...data,
          id: doc.id,
          createdAt,
          updatedAt
        };
      })
      .filter((group): group is CategoryGroup => group !== null);

    // Process budget history
    const budgetHistory = budgetHistorySnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data || !data.timestamp) return null;
        const timestamp = safeTimestampToString(data.timestamp);
        if (!timestamp) return null;
        return {
          ...data,
          id: doc.id,
          timestamp
        };
      })
      .filter((history): history is BudgetHistory => history !== null);

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

    const recurringExpenses = recurringExpensesSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data) return null;
        
        // Ensure all required fields are present
        if (!data.amount || !data.category || !data.paidBy || !data.split || 
            !data.startDate || !data.frequency || !data.dayOfMonth || !Array.isArray(data.tags)) {
          return null;
        }

        const lastProcessed = data.lastProcessed ? safeTimestampToString(data.lastProcessed) : undefined;
        
        const expense: RecurringExpense = {
          id: doc.id,
          description: data.description,
          amount: data.amount,
          category: data.category,
          paidBy: data.paidBy,
          split: data.split,
          startDate: data.startDate,
          frequency: data.frequency,
          dayOfMonth: data.dayOfMonth,
          tags: data.tags,
          lastProcessed
        };
        return expense;
      })
      .filter((expense): expense is RecurringExpense => expense !== null);

    const settlements = settlementsSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data) return null;
        const settledAt = safeTimestampToString(data.settledAt);
        if (!settledAt) return null;
        return {
          ...data,
          settledAt
        };
      })
      .filter((settlement): settlement is Settlement => settlement !== null);

    return {
      expenses,
      categories,
      categoryGroups,
      tags,
      budgets,
      budgetHistory,
      recurringExpenses,
      settlements
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
