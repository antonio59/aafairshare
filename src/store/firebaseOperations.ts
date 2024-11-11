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
  expensesRef = collection(db, 'expenses');
  categoriesRef = collection(db, 'categories');
  categoryGroupsRef = collection(db, 'categoryGroups');
  tagsRef = collection(db, 'tags');
  budgetsRef = collection(db, 'budgets');
  recurringExpensesRef = collection(db, 'recurringExpenses');
  settlementsRef = collection(db, 'settlements');
};

// Initialize collections immediately
initializeCollections();

// Helper functions
const dateToTimestamp = (dateStr: string) => Timestamp.fromDate(new Date(dateStr));
const timestampToString = (timestamp: Timestamp) => timestamp.toDate().toISOString();

// CRUD Operations for Category Groups
export const addCategoryGroupToFirestore = async (group: CategoryGroup) => {
  const docRef = doc(categoryGroupsRef, group.id);
  await setDoc(docRef, group);
};

export const updateCategoryGroupInFirestore = async (id: string, group: Partial<CategoryGroup>) => {
  const docRef = doc(categoryGroupsRef, id);
  await updateDoc(docRef, group);
};

export const deleteCategoryGroupFromFirestore = async (id: string) => {
  const docRef = doc(categoryGroupsRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Categories
export const addCategoryToFirestore = async (category: Category) => {
  const docRef = doc(categoriesRef, category.id);
  await setDoc(docRef, category);
};

export const updateCategoryInFirestore = async (id: string, category: Partial<Category>) => {
  const docRef = doc(categoriesRef, id);
  await updateDoc(docRef, category);
};

export const deleteCategoryFromFirestore = async (id: string) => {
  const docRef = doc(categoriesRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Tags
export const addTagToFirestore = async (tag: Tag) => {
  const docRef = doc(tagsRef, tag.id);
  await setDoc(docRef, tag);
};

export const updateTagInFirestore = async (id: string, tag: Partial<Tag>) => {
  const docRef = doc(tagsRef, id);
  await updateDoc(docRef, tag);
};

export const deleteTagFromFirestore = async (id: string) => {
  const docRef = doc(tagsRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Budgets
export const addBudgetToFirestore = async (budget: Budget) => {
  const docRef = doc(budgetsRef, budget.id);
  await setDoc(docRef, budget);
};

export const updateBudgetInFirestore = async (id: string, budget: Partial<Budget>) => {
  const docRef = doc(budgetsRef, id);
  await updateDoc(docRef, budget);
};

export const deleteBudgetFromFirestore = async (id: string) => {
  const docRef = doc(budgetsRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Recurring Expenses
export const addRecurringExpenseToFirestore = async (expense: RecurringExpense) => {
  const docRef = doc(recurringExpensesRef, expense.id);
  await setDoc(docRef, {
    ...expense,
    lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : null
  });
};

export const updateRecurringExpenseInFirestore = async (id: string, expense: Partial<RecurringExpense>) => {
  const docRef = doc(recurringExpensesRef, id);
  const updateData = {
    ...expense,
    lastProcessed: expense.lastProcessed ? dateToTimestamp(expense.lastProcessed) : undefined
  };
  await updateDoc(docRef, updateData);
};

export const deleteRecurringExpenseFromFirestore = async (id: string) => {
  const docRef = doc(recurringExpensesRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Expenses
export const addExpenseToFirestore = async (expense: Expense) => {
  const docRef = doc(expensesRef, expense.id);
  await setDoc(docRef, {
    ...expense,
    date: dateToTimestamp(expense.date)
  });
};

export const updateExpenseInFirestore = async (id: string, expense: Partial<Expense>) => {
  const docRef = doc(expensesRef, id);
  const updateData = {
    ...expense,
    date: expense.date ? dateToTimestamp(expense.date) : undefined
  };
  await updateDoc(docRef, updateData);
};

export const deleteExpenseFromFirestore = async (id: string) => {
  const docRef = doc(expensesRef, id);
  await deleteDoc(docRef);
};

// CRUD Operations for Settlements
export const addSettlementToFirestore = async (settlement: Settlement) => {
  const docRef = doc(settlementsRef, settlement.month);
  await setDoc(docRef, {
    ...settlement,
    settledAt: dateToTimestamp(settlement.settledAt)
  });
};

// Fetch all data
export const fetchAllData = async (): Promise<FirestoreData> => {
  const expenses = await getDocs(expensesRef);
  const categories = await getDocs(categoriesRef);
  const categoryGroups = await getDocs(categoryGroupsRef);
  const tags = await getDocs(tagsRef);
  const budgets = await getDocs(budgetsRef);
  const recurringExpenses = await getDocs(recurringExpensesRef);
  const settlements = await getDocs(settlementsRef);

  return {
    expenses: expenses.docs.map(doc => ({
      ...doc.data(),
      date: timestampToString(doc.data().date)
    })) as Expense[],
    categories: categories.docs.map(doc => doc.data()) as Category[],
    categoryGroups: categoryGroups.docs.map(doc => doc.data()) as CategoryGroup[],
    tags: tags.docs.map(doc => doc.data()) as Tag[],
    budgets: budgets.docs.map(doc => doc.data()) as Budget[],
    recurringExpenses: recurringExpenses.docs.map(doc => ({
      ...doc.data(),
      lastProcessed: doc.data().lastProcessed ? timestampToString(doc.data().lastProcessed) : null
    })) as RecurringExpense[],
    settlements: settlements.docs.map(doc => ({
      ...doc.data(),
      settledAt: timestampToString(doc.data().settledAt)
    })) as Settlement[]
  };
};
