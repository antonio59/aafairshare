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
  getDoc,
  writeBatch
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
  console.log('Adding budget history to Firestore:', history);
  try {
    initializeCollections();
    const docRef = doc(budgetHistoryRef, history.id);
    await setDoc(docRef, {
      ...history,
      timestamp: dateToTimestamp(history.timestamp)
    });
    console.log('Budget history added successfully:', history.id);
  } catch (error) {
    console.error('Error adding budget history to Firestore:', error);
    throw error;
  }
};

// Budget Operations
export const addBudgetToFirestore = async (budget: Budget) => {
  console.log('Adding budget to Firestore:', budget);
  try {
    initializeCollections();
    const docRef = doc(budgetsRef, budget.id);
    await setDoc(docRef, budget);
    console.log('Budget added successfully:', budget.id);
  } catch (error) {
    console.error('Error adding budget to Firestore:', error);
    throw error;
  }
};

export const updateBudgetInFirestore = async (id: string, budget: Partial<Budget>) => {
  console.log('Updating budget in Firestore:', id, budget);
  try {
    initializeCollections();
    const docRef = doc(budgetsRef, id);
    await updateDoc(docRef, budget);
    console.log('Budget updated successfully:', id);
  } catch (error) {
    console.error('Error updating budget in Firestore:', error);
    throw error;
  }
};

export const deleteBudgetFromFirestore = async (id: string) => {
  console.log('Deleting budget from Firestore:', id);
  try {
    initializeCollections();
    const docRef = doc(budgetsRef, id);
    await deleteDoc(docRef);
    console.log('Budget deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting budget from Firestore:', error);
    throw error;
  }
};

// Category Operations
export const addCategoryToFirestore = async (category: Category) => {
  console.log('Adding category to Firestore:', category);
  try {
    initializeCollections();
    const docRef = doc(categoriesRef, category.id);
    await setDoc(docRef, category);
    console.log('Category added successfully:', category.id);
  } catch (error) {
    console.error('Error adding category to Firestore:', error);
    throw error;
  }
};

export const updateCategoryInFirestore = async (id: string, category: Partial<Category>) => {
  console.log('Updating category in Firestore:', id, category);
  try {
    initializeCollections();
    const docRef = doc(categoriesRef, id);
    await updateDoc(docRef, category);
    console.log('Category updated successfully:', id);
  } catch (error) {
    console.error('Error updating category in Firestore:', error);
    throw error;
  }
};

export const deleteCategoryFromFirestore = async (id: string) => {
  console.log('Deleting category from Firestore:', id);
  try {
    initializeCollections();
    const docRef = doc(categoriesRef, id);
    await deleteDoc(docRef);
    console.log('Category deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting category from Firestore:', error);
    throw error;
  }
};

// Category Group Operations
export const addCategoryGroupToFirestore = async (group: CategoryGroup) => {
  console.log('Adding category group to Firestore:', group);
  try {
    initializeCollections();
    const docRef = doc(categoryGroupsRef, group.id);
    await setDoc(docRef, {
      ...group,
      createdAt: dateToTimestamp(group.createdAt),
      updatedAt: dateToTimestamp(group.updatedAt)
    });
    console.log('Category group added successfully:', group.id);
  } catch (error) {
    console.error('Error adding category group to Firestore:', error);
    throw error;
  }
};

export const updateCategoryGroupInFirestore = async (id: string, group: Partial<CategoryGroup>) => {
  console.log('Updating category group in Firestore:', id, group);
  try {
    initializeCollections();
    const docRef = doc(categoryGroupsRef, id);
    const updateData = {
      ...group,
      updatedAt: group.updatedAt ? dateToTimestamp(group.updatedAt) : undefined
    };
    await updateDoc(docRef, updateData);
    console.log('Category group updated successfully:', id);
  } catch (error) {
    console.error('Error updating category group in Firestore:', error);
    throw error;
  }
};

export const deleteCategoryGroupFromFirestore = async (id: string) => {
  console.log('Deleting category group from Firestore:', id);
  try {
    initializeCollections();
    const batch = writeBatch(db);

    // Delete the category group
    const groupRef = doc(categoryGroupsRef, id);
    batch.delete(groupRef);

    // Delete all categories in the group
    const categoriesSnapshot = await getDocs(categoriesRef);
    categoriesSnapshot.docs.forEach(doc => {
      const category = doc.data() as Category;
      if (category.groupId === id) {
        batch.delete(doc.ref);
      }
    });

    await batch.commit();
    console.log('Category group and associated categories deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting category group from Firestore:', error);
    throw error;
  }
};

// Tag Operations
export const addTagToFirestore = async (tag: Tag) => {
  console.log('Adding tag to Firestore:', tag);
  try {
    initializeCollections();
    const docRef = doc(tagsRef, tag.id);
    await setDoc(docRef, tag);
    console.log('Tag added successfully:', tag.id);
  } catch (error) {
    console.error('Error adding tag to Firestore:', error);
    throw error;
  }
};

export const updateTagInFirestore = async (id: string, tag: Partial<Tag>) => {
  console.log('Updating tag in Firestore:', id, tag);
  try {
    initializeCollections();
    const docRef = doc(tagsRef, id);
    await updateDoc(docRef, tag);
    console.log('Tag updated successfully:', id);
  } catch (error) {
    console.error('Error updating tag in Firestore:', error);
    throw error;
  }
};

export const deleteTagFromFirestore = async (id: string) => {
  console.log('Deleting tag from Firestore:', id);
  try {
    initializeCollections();
    const docRef = doc(tagsRef, id);
    await deleteDoc(docRef);
    console.log('Tag deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting tag from Firestore:', error);
    throw error;
  }
};

// Expense Operations
export const addExpenseToFirestore = async (expense: Expense) => {
  console.log('Adding expense to Firestore:', expense);
  try {
    initializeCollections();
    const docRef = doc(expensesRef, expense.id);
    await setDoc(docRef, {
      ...expense,
      date: dateToTimestamp(expense.date)
    });
    console.log('Expense added successfully:', expense.id);
  } catch (error) {
    console.error('Error adding expense to Firestore:', error);
    throw error;
  }
};

export const updateExpenseInFirestore = async (id: string, expense: Partial<Expense>) => {
  console.log('Updating expense in Firestore:', id, expense);
  try {
    initializeCollections();
    const docRef = doc(expensesRef, id);
    const updateData = {
      ...expense,
      date: expense.date ? dateToTimestamp(expense.date) : undefined
    };
    await updateDoc(docRef, updateData);
    console.log('Expense updated successfully:', id);
  } catch (error) {
    console.error('Error updating expense in Firestore:', error);
    throw error;
  }
};

export const deleteExpenseFromFirestore = async (id: string) => {
  console.log('Deleting expense from Firestore:', id);
  try {
    initializeCollections();
    const docRef = doc(expensesRef, id);
    await deleteDoc(docRef);
    console.log('Expense deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting expense from Firestore:', error);
    throw error;
  }
};

// Recurring Expense Operations
export const addRecurringExpenseToFirestore = async (expense: RecurringExpense) => {
  console.log('Adding recurring expense to Firestore:', expense);
  try {
    initializeCollections();
    const docRef = doc(recurringExpensesRef, expense.id);
    await setDoc(docRef, {
      ...expense,
      lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : null
    });
    console.log('Recurring expense added successfully:', expense.id);
  } catch (error) {
    console.error('Error adding recurring expense to Firestore:', error);
    throw error;
  }
};

export const updateRecurringExpenseInFirestore = async (id: string, expense: Partial<RecurringExpense>) => {
  console.log('Updating recurring expense in Firestore:', id, expense);
  try {
    initializeCollections();
    const docRef = doc(recurringExpensesRef, id);
    const updateData = {
      ...expense,
      lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : undefined
    };
    await updateDoc(docRef, updateData);
    console.log('Recurring expense updated successfully:', id);
  } catch (error) {
    console.error('Error updating recurring expense in Firestore:', error);
    throw error;
  }
};

export const deleteRecurringExpenseFromFirestore = async (id: string) => {
  console.log('Deleting recurring expense from Firestore:', id);
  try {
    initializeCollections();
    const docRef = doc(recurringExpensesRef, id);
    await deleteDoc(docRef);
    console.log('Recurring expense deleted successfully:', id);
  } catch (error) {
    console.error('Error deleting recurring expense from Firestore:', error);
    throw error;
  }
};

// Settlement Operations
export const addSettlementToFirestore = async (settlement: Settlement) => {
  console.log('Adding settlement to Firestore:', settlement);
  try {
    initializeCollections();
    const docRef = doc(settlementsRef, settlement.month);
    await setDoc(docRef, {
      ...settlement,
      settledAt: dateToTimestamp(settlement.settledAt)
    });
    console.log('Settlement added successfully:', settlement.month);
  } catch (error) {
    console.error('Error adding settlement to Firestore:', error);
    throw error;
  }
};

// Fetch all data with improved error handling and data validation
export const fetchAllData = async (): Promise<FirestoreData> => {
  console.log('Fetching all data from Firestore');
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

    // Process category groups with validation
    const categoryGroups = categoryGroupsSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data) {
          console.warn('Invalid category group data:', doc.id);
          return null;
        }
        const createdAt = safeTimestampToString(data.createdAt);
        const updatedAt = safeTimestampToString(data.updatedAt);
        if (!createdAt || !updatedAt) {
          console.warn('Invalid timestamps in category group:', doc.id);
          return null;
        }
        return {
          ...data,
          id: doc.id,
          createdAt,
          updatedAt
        };
      })
      .filter((group): group is CategoryGroup => group !== null);

    console.log('Fetched category groups:', categoryGroups);

    // Process categories with validation
    const categories = categoriesSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data || !data.groupId || !data.name || !data.color) {
          console.warn('Invalid category data:', doc.id);
          return null;
        }
        // Verify the category's group exists
        const groupExists = categoryGroups.some(group => group.id === data.groupId);
        if (!groupExists) {
          console.warn('Category references non-existent group:', doc.id, data.groupId);
          return null;
        }
        return {
          ...data,
          id: doc.id
        };
      })
      .filter((category): category is Category => category !== null);

    console.log('Fetched categories:', categories);

    // Process other collections
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

    const tags = tagsSnapshot.docs
      .map(doc => ({ ...safeDocumentData(doc), id: doc.id }))
      .filter((tag): tag is Tag => tag !== null);

    const budgets = budgetsSnapshot.docs
      .map(doc => ({ ...safeDocumentData(doc), id: doc.id }))
      .filter((budget): budget is Budget => budget !== null);

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

    const recurringExpenses = recurringExpensesSnapshot.docs
      .map(doc => {
        const data = safeDocumentData(doc);
        if (!data) return null;
        const lastProcessed = data.lastProcessed ? safeTimestampToString(data.lastProcessed) : undefined;
        return {
          ...data,
          id: doc.id,
          lastProcessed
        } as RecurringExpense;
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

    console.log('Fetch completed successfully');
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
    console.error('Error fetching data from Firestore:', error);
    throw error;
  }
};
