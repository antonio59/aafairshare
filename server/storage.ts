import { 
  User, 
  InsertUser, 
  Category, 
  InsertCategory, 
  Location, 
  InsertLocation,
  Expense,
  InsertExpense,
  ExpenseWithDetails,
  Settlement,
  InsertSettlement,
  SettlementWithUsers,
  RecurringExpense,
  InsertRecurringExpense,
  RecurringExpenseWithDetails,
  MonthSummary,
  users, 
  categories,
  locations,
  expenses,
  settlements,
  recurringExpenses
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, sql, gt, lte, isNull, count, sum } from "drizzle-orm";

export interface IStorage {
  // Error handling callback - returns true if operation should continue with fallback
  onStorageOperationError?: (operation: string, error: any) => boolean;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Location operations
  getLocation(id: number): Promise<Location | undefined>;
  getAllLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;
  
  // Expense operations
  getExpense(id: number): Promise<ExpenseWithDetails | undefined>;
  getAllExpenses(): Promise<ExpenseWithDetails[]>;
  getExpensesByMonth(month: string): Promise<ExpenseWithDetails[]>;
  createExpense(expense: InsertExpense): Promise<ExpenseWithDetails>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Recurring Expense operations
  getRecurringExpense(id: number): Promise<RecurringExpenseWithDetails | undefined>;
  getAllRecurringExpenses(): Promise<RecurringExpenseWithDetails[]>;
  getActiveRecurringExpenses(): Promise<RecurringExpenseWithDetails[]>;
  createRecurringExpense(recurringExpense: InsertRecurringExpense): Promise<RecurringExpenseWithDetails>;
  updateRecurringExpense(id: number, recurringExpense: Partial<InsertRecurringExpense>): Promise<RecurringExpenseWithDetails | undefined>;
  deleteRecurringExpense(id: number): Promise<boolean>;
  processRecurringExpenses(): Promise<ExpenseWithDetails[]>;
  
  // Settlement operations
  getSettlement(id: number): Promise<SettlementWithUsers | undefined>;
  getAllSettlements(): Promise<SettlementWithUsers[]>;
  getSettlementsByMonth(month: string): Promise<SettlementWithUsers[]>;
  createSettlement(settlement: InsertSettlement): Promise<SettlementWithUsers>;
  
  // Summary operations
  getMonthSummary(month: string): Promise<MonthSummary>;
}

export class MemStorage implements IStorage {
  onStorageOperationError?: (operation: string, error: any) => boolean;
  
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private locations: Map<number, Location>;
  private expenses: Map<number, Expense>;
  private settlements: Map<number, Settlement>;
  private recurringExpenses: Map<number, RecurringExpense>;
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private locationIdCounter: number;
  private expenseIdCounter: number;
  private settlementIdCounter: number;
  private recurringExpenseIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.locations = new Map();
    this.expenses = new Map();
    this.settlements = new Map();
    this.recurringExpenses = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.locationIdCounter = 1;
    this.expenseIdCounter = 1;
    this.settlementIdCounter = 1;
    this.recurringExpenseIdCounter = 1;
    
    // Initialize with default users
    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    // Create default users
    const john: InsertUser = { username: "John", email: "john@example.com", password: "password" };
    const sarah: InsertUser = { username: "Sarah", email: "sarah@example.com", password: "password" };
    this.createUser(john);
    this.createUser(sarah);
    
    // Create default categories
    const categories: InsertCategory[] = [
      { name: "Groceries", icon: "ShoppingCart", color: "#3B82F6" },
      { name: "Utilities", icon: "Home", color: "#10B981" },
      { name: "Entertainment", icon: "Film", color: "#8B5CF6" },
      { name: "Dining", icon: "Utensils", color: "#F59E0B" },
      { name: "Transport", icon: "Car", color: "#EF4444" }
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Create default locations
    const locations: InsertLocation[] = [
      { name: "Tesco" },
      { name: "Amazon" },
      { name: "Cinema" },
      { name: "Electric Company" },
      { name: "Restaurant" }
    ];
    
    locations.forEach(location => this.createLocation(location));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updatedCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) {
      return undefined;
    }
    
    const updated = { ...existingCategory, ...updatedCategory };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Location operations
  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.locationIdCounter++;
    const location = { ...insertLocation, id };
    this.locations.set(id, location);
    return location;
  }

  async updateLocation(id: number, updatedLocation: Partial<InsertLocation>): Promise<Location | undefined> {
    const existingLocation = this.locations.get(id);
    if (!existingLocation) {
      return undefined;
    }
    
    const updated = { ...existingLocation, ...updatedLocation };
    this.locations.set(id, updated);
    return updated;
  }

  async deleteLocation(id: number): Promise<boolean> {
    return this.locations.delete(id);
  }

  // Expense operations
  async getExpense(id: number): Promise<ExpenseWithDetails | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) {
      return undefined;
    }
    
    const category = await this.getCategory(expense.category_id);
    const location = await this.getLocation(expense.location_id);
    const paidByUser = await this.getUser(expense.paid_by_user_id);
    
    if (!category || !location || !paidByUser) {
      return undefined;
    }
    
    return {
      ...expense,
      category,
      location,
      paidByUser
    };
  }

  async getAllExpenses(): Promise<ExpenseWithDetails[]> {
    const expenses = Array.from(this.expenses.values());
    const expensesWithDetails: ExpenseWithDetails[] = [];
    
    for (const expense of expenses) {
      const category = await this.getCategory(expense.category_id);
      const location = await this.getLocation(expense.location_id);
      const paidByUser = await this.getUser(expense.paid_by_user_id);
      
      if (category && location && paidByUser) {
        expensesWithDetails.push({
          ...expense,
          category,
          location,
          paidByUser
        });
      }
    }
    
    return expensesWithDetails.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  async getExpensesByMonth(month: string): Promise<ExpenseWithDetails[]> {
    const allExpenses = await this.getAllExpenses();
    return allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      return expenseMonth === month;
    });
  }

  async createExpense(insertExpense: InsertExpense): Promise<ExpenseWithDetails> {
    const id = this.expenseIdCounter++;
    // Ensure that split_type and month are always defined with default values if needed
    const expense = { 
      ...insertExpense, 
      id,
      split_type: insertExpense.split_type || "50/50",
      notes: insertExpense.notes || null,
      month: insertExpense.month || null
    };
    this.expenses.set(id, expense);
    
    const expenseWithDetails = await this.getExpense(id);
    if (!expenseWithDetails) {
      throw new Error("Failed to create expense with details");
    }
    
    return expenseWithDetails;
  }

  async updateExpense(id: number, updatedExpense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined> {
    const existingExpense = this.expenses.get(id);
    if (!existingExpense) {
      return undefined;
    }
    
    const updated = { ...existingExpense, ...updatedExpense };
    this.expenses.set(id, updated);
    
    return this.getExpense(id);
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Recurring Expense operations
  async getRecurringExpense(id: number): Promise<RecurringExpenseWithDetails | undefined> {
    const recurringExpense = this.recurringExpenses.get(id);
    if (!recurringExpense) {
      return undefined;
    }
    
    const category = await this.getCategory(recurringExpense.category_id);
    const location = await this.getLocation(recurringExpense.location_id);
    const paidByUser = await this.getUser(recurringExpense.paid_by_user_id);
    
    if (!category || !location || !paidByUser) {
      return undefined;
    }
    
    return {
      ...recurringExpense,
      category,
      location,
      paidByUser
    };
  }

  async getAllRecurringExpenses(): Promise<RecurringExpenseWithDetails[]> {
    const recurringExpenses = Array.from(this.recurringExpenses.values());
    const recurringExpensesWithDetails: RecurringExpenseWithDetails[] = [];
    
    for (const recurringExpense of recurringExpenses) {
      const category = await this.getCategory(recurringExpense.category_id);
      const location = await this.getLocation(recurringExpense.location_id);
      const paidByUser = await this.getUser(recurringExpense.paid_by_user_id);
      
      if (category && location && paidByUser) {
        recurringExpensesWithDetails.push({
          ...recurringExpense,
          category,
          location,
          paidByUser
        });
      }
    }
    
    return recurringExpensesWithDetails.sort((a, b) => {
      return new Date(b.next_date).getTime() - new Date(a.next_date).getTime();
    });
  }

  async getActiveRecurringExpenses(): Promise<RecurringExpenseWithDetails[]> {
    const allRecurringExpenses = await this.getAllRecurringExpenses();
    return allRecurringExpenses.filter(expense => expense.is_active);
  }

  async createRecurringExpense(insertRecurringExpense: InsertRecurringExpense): Promise<RecurringExpenseWithDetails> {
    const id = this.recurringExpenseIdCounter++;
    // Ensure that split_type and is_active are always defined with default values if needed
    const recurringExpense = { 
      ...insertRecurringExpense, 
      id,
      split_type: insertRecurringExpense.split_type || "50/50",
      notes: insertRecurringExpense.notes || null,
      is_active: insertRecurringExpense.is_active ?? true,
      // Ensure end_date is either a Date or null, not undefined
      end_date: insertRecurringExpense.end_date || null
    };
    this.recurringExpenses.set(id, recurringExpense);
    
    const recurringExpenseWithDetails = await this.getRecurringExpense(id);
    if (!recurringExpenseWithDetails) {
      throw new Error("Failed to create recurring expense with details");
    }
    
    return recurringExpenseWithDetails;
  }

  async updateRecurringExpense(id: number, updatedRecurringExpense: Partial<InsertRecurringExpense>): Promise<RecurringExpenseWithDetails | undefined> {
    const existingRecurringExpense = this.recurringExpenses.get(id);
    if (!existingRecurringExpense) {
      return undefined;
    }
    
    // Make a copy of the updatedRecurringExpense object to avoid mutating the input
    const updatedData = { ...updatedRecurringExpense };
    
    // Make sure end_date is either a Date or null, not undefined
    if ('end_date' in updatedData) {
      updatedData.end_date = updatedData.end_date || null;
    }
    
    const updated = { ...existingRecurringExpense, ...updatedData };
    this.recurringExpenses.set(id, updated);
    
    return this.getRecurringExpense(id);
  }

  async deleteRecurringExpense(id: number): Promise<boolean> {
    return this.recurringExpenses.delete(id);
  }

  // Function to process recurring expenses and create actual expenses from them
  async processRecurringExpenses(): Promise<ExpenseWithDetails[]> {
    const today = new Date();
    const activeRecurringExpenses = await this.getActiveRecurringExpenses();
    const createdExpenses: ExpenseWithDetails[] = [];
    
    for (const recurringExpense of activeRecurringExpenses) {
      const nextDate = new Date(recurringExpense.next_date);
      
      // Check if next_date is today or in the past
      if (nextDate <= today) {
        // Create a new expense based on the recurring expense
        const newExpense: InsertExpense = {
          amount: recurringExpense.amount,
          date: nextDate,
          paid_by_user_id: recurringExpense.paid_by_user_id,
          split_type: recurringExpense.split_type,
          notes: recurringExpense.notes ? `${recurringExpense.notes} (Recurring: ${recurringExpense.name})` : `Recurring: ${recurringExpense.name}`,
          category_id: recurringExpense.category_id,
          location_id: recurringExpense.location_id,
          description: recurringExpense.description
        };
        
        const createdExpense = await this.createExpense(newExpense);
        createdExpenses.push(createdExpense);
        
        // Calculate and update the next occurrence date
        const nextOccurrenceDate = this.calculateNextOccurrence(nextDate, recurringExpense.frequency);
        
        // Check if end_date is defined and next occurrence exceeds it
        if (recurringExpense.end_date && nextOccurrenceDate > new Date(recurringExpense.end_date)) {
          // Deactivate the recurring expense
          await this.updateRecurringExpense(recurringExpense.id, { is_active: false });
        } else {
          // Update the next_date
          await this.updateRecurringExpense(recurringExpense.id, { 
            next_date: nextOccurrenceDate 
          });
        }
      }
    }
    
    return createdExpenses;
  }
  
  // Helper function to calculate the next occurrence based on frequency
  private calculateNextOccurrence(currentDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        // Default to monthly if frequency is not recognized
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate;
  }

  // Settlement operations
  async getSettlement(id: number): Promise<SettlementWithUsers | undefined> {
    const settlement = this.settlements.get(id);
    if (!settlement) {
      return undefined;
    }
    
    const fromUser = await this.getUser(settlement.from_user_id);
    const toUser = await this.getUser(settlement.to_user_id);
    
    if (!fromUser || !toUser) {
      return undefined;
    }
    
    return {
      ...settlement,
      fromUser,
      toUser
    };
  }

  async getAllSettlements(): Promise<SettlementWithUsers[]> {
    const settlements = Array.from(this.settlements.values());
    const settlementsWithUsers: SettlementWithUsers[] = [];
    
    for (const settlement of settlements) {
      const fromUser = await this.getUser(settlement.from_user_id);
      const toUser = await this.getUser(settlement.to_user_id);
      
      if (fromUser && toUser) {
        settlementsWithUsers.push({
          ...settlement,
          fromUser,
          toUser
        });
      }
    }
    
    return settlementsWithUsers.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  async getSettlementsByMonth(month: string): Promise<SettlementWithUsers[]> {
    const allSettlements = await this.getAllSettlements();
    return allSettlements.filter(settlement => settlement.month === month);
  }

  async createSettlement(insertSettlement: InsertSettlement): Promise<SettlementWithUsers> {
    const id = this.settlementIdCounter++;
    const settlement = { 
      ...insertSettlement, 
      id,
      notes: insertSettlement.notes || null 
    };
    this.settlements.set(id, settlement);
    
    const settlementWithUsers = await this.getSettlement(id);
    if (!settlementWithUsers) {
      throw new Error("Failed to create settlement with users");
    }
    
    return settlementWithUsers;
  }

  // Summary operations
  async getMonthSummary(month: string): Promise<MonthSummary> {
    const expenses = await this.getExpensesByMonth(month);
    const users = await this.getAllUsers();
    const categories = await this.getAllCategories();
    const locations = await this.getAllLocations();
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((total, expense) => total + Number(expense.amount), 0);
    
    // Calculate expenses by user
    const userExpenses: Record<number, number> = {};
    users.forEach(user => {
      userExpenses[user.id] = expenses
        .filter(expense => expense.paid_by_user_id === user.id)
        .reduce((total, expense) => total + Number(expense.amount), 0);
    });
    
    // Calculate category totals
    const categoryTotals = categories.map(category => {
      const categoryExpenses = expenses.filter(expense => expense.category_id === category.id);
      const amount = categoryExpenses.reduce((total, expense) => total + Number(expense.amount), 0);
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      
      return {
        category,
        amount,
        percentage
      };
    }).filter(categoryTotal => categoryTotal.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    
    // Calculate location totals
    const locationTotals = locations.map(location => {
      const locationExpenses = expenses.filter(expense => expense.location_id === location.id);
      const amount = locationExpenses.reduce((total, expense) => total + Number(expense.amount), 0);
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
      
      return {
        location,
        amount,
        percentage
      };
    }).filter(locationTotal => locationTotal.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    
    // Calculate split type totals
    const splitTypeTotals: Record<string, number> = {};
    expenses.forEach(expense => {
      const amount = Number(expense.amount);
      if (!splitTypeTotals[expense.split_type]) {
        splitTypeTotals[expense.split_type] = 0;
      }
      splitTypeTotals[expense.split_type] += amount;
    });
    
    // Calculate date distribution (by day of month)
    const dateDistribution: Record<string, number> = {};
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const dayOfMonth = date.getDate().toString();
      if (!dateDistribution[dayOfMonth]) {
        dateDistribution[dayOfMonth] = 0;
      }
      dateDistribution[dayOfMonth] += Number(expense.amount);
    });
    
    // Calculate settlement amount and direction
    let settlementAmount = 0;
    let fromUserId = 0;
    let toUserId = 0;
    
    if (users.length >= 2) {
      const user1 = users[0];
      const user2 = users[1];
      
      const user1Paid = userExpenses[user1.id] || 0;
      const user2Paid = userExpenses[user2.id] || 0;
      
      // Calculate each user's share based on split types
      let user1Share = 0;
      let user2Share = 0;
      
      // Calculate shares based on expense split types
      expenses.forEach(expense => {
        const amount = Number(expense.amount);
        
        if (expense.split_type === "50/50") {
          // 50/50 split - each user pays half
          user1Share += amount / 2;
          user2Share += amount / 2;
        } else if (expense.split_type === "100%") {
          // 100% Other User - the other user pays full amount
          if (expense.paid_by_user_id === user1.id) {
            // User 1 paid, but User 2 owes 100%
            user2Share += amount;
          } else if (expense.paid_by_user_id === user2.id) {
            // User 2 paid, but User 1 owes 100%
            user1Share += amount;
          }
        }
      });
      
      // Calculate balance (what each user paid minus what they should have paid)
      const user1Balance = user1Paid - user1Share;
      const user2Balance = user2Paid - user2Share;
      
      if (user1Balance > 0) {
        // User 1 paid more than their share, so User 2 owes User 1
        settlementAmount = Math.abs(user1Balance);
        fromUserId = user2.id;
        toUserId = user1.id;
      } else {
        // User 2 paid more than their share, so User 1 owes User 2
        settlementAmount = Math.abs(user2Balance);
        fromUserId = user1.id;
        toUserId = user2.id;
      }
    }
    
    return {
      month,
      totalExpenses,
      userExpenses,
      categoryTotals,
      locationTotals,
      splitTypeTotals,
      dateDistribution,
      settlementAmount,
      settlementDirection: {
        fromUserId,
        toUserId
      }
    };
  }
}

// Create and export a default instance of MemStorage
export class DatabaseStorage implements IStorage {
  onStorageOperationError?: (operation: string, error: any) => boolean;

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getUser', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error(`Error getting user by username ${username}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getUserByUsername', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getUserByEmail', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const [createdUser] = await db.insert(users).values(user).returning();
      return createdUser;
    } catch (error) {
      console.error(`Error creating user:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('createUser', error)) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error(`Error getting all users:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getAllUsers', error)) {
        return [];
      }
      throw error;
    }
  }

  async getCategory(id: number): Promise<Category | undefined> {
    try {
      const [category] = await db.select().from(categories).where(eq(categories.id, id));
      return category;
    } catch (error) {
      console.error(`Error getting category ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getCategory', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories);
    } catch (error) {
      console.error(`Error getting all categories:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getAllCategories', error)) {
        return [];
      }
      throw error;
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const [createdCategory] = await db.insert(categories).values(category).returning();
      return createdCategory;
    } catch (error) {
      console.error(`Error creating category:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('createCategory', error)) {
        throw new Error(`Failed to create category: ${error.message}`);
      }
      throw error;
    }
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      const [updatedCategory] = await db
        .update(categories)
        .set(category)
        .where(eq(categories.id, id))
        .returning();
      return updatedCategory;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('updateCategory', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      const result = await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('deleteCategory', error)) {
        return false;
      }
      throw error;
    }
  }

  async getLocation(id: number): Promise<Location | undefined> {
    try {
      const [location] = await db.select().from(locations).where(eq(locations.id, id));
      return location;
    } catch (error) {
      console.error(`Error getting location ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getLocation', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async getAllLocations(): Promise<Location[]> {
    try {
      return await db.select().from(locations);
    } catch (error) {
      console.error(`Error getting all locations:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getAllLocations', error)) {
        return [];
      }
      throw error;
    }
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    try {
      const [createdLocation] = await db.insert(locations).values(location).returning();
      return createdLocation;
    } catch (error) {
      console.error(`Error creating location:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('createLocation', error)) {
        throw new Error(`Failed to create location: ${error.message}`);
      }
      throw error;
    }
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    try {
      const [updatedLocation] = await db
        .update(locations)
        .set(location)
        .where(eq(locations.id, id))
        .returning();
      return updatedLocation;
    } catch (error) {
      console.error(`Error updating location ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('updateLocation', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async deleteLocation(id: number): Promise<boolean> {
    try {
      const result = await db.delete(locations).where(eq(locations.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting location ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('deleteLocation', error)) {
        return false;
      }
      throw error;
    }
  }

  async getExpense(id: number): Promise<ExpenseWithDetails | undefined> {
    try {
      // Get expense with related data
      const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
      
      if (!expense) {
        return undefined;
      }
      
      // Get related data
      const [category] = await db.select().from(categories).where(eq(categories.id, expense.category_id));
      const [location] = await db.select().from(locations).where(eq(locations.id, expense.location_id));
      const [paidByUser] = await db.select().from(users).where(eq(users.id, expense.paid_by_user_id));
      
      if (!category || !location || !paidByUser) {
        return undefined;
      }
      
      return {
        ...expense,
        category,
        location,
        paidByUser
      };
    } catch (error) {
      console.error(`Error getting expense ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getExpense', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async getAllExpenses(): Promise<ExpenseWithDetails[]> {
    try {
      // Get all expenses
      const allExpenses = await db.select().from(expenses).orderBy(desc(expenses.date));
      const expensesWithDetails: ExpenseWithDetails[] = [];
      
      // Get related data for each expense
      for (const expense of allExpenses) {
        const [category] = await db.select().from(categories).where(eq(categories.id, expense.category_id));
        const [location] = await db.select().from(locations).where(eq(locations.id, expense.location_id));
        const [paidByUser] = await db.select().from(users).where(eq(users.id, expense.paid_by_user_id));
        
        if (category && location && paidByUser) {
          expensesWithDetails.push({
            ...expense,
            category,
            location,
            paidByUser
          });
        }
      }
      
      return expensesWithDetails;
    } catch (error) {
      console.error(`Error getting all expenses:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getAllExpenses', error)) {
        return [];
      }
      throw error;
    }
  }

  async getExpensesByMonth(month: string): Promise<ExpenseWithDetails[]> {
    try {
      // Get expenses by month
      const monthExpenses = await db
        .select()
        .from(expenses)
        .where(eq(expenses.month, month))
        .orderBy(desc(expenses.date));
      
      const expensesWithDetails: ExpenseWithDetails[] = [];
      
      // Get related data for each expense
      for (const expense of monthExpenses) {
        const [category] = await db.select().from(categories).where(eq(categories.id, expense.category_id));
        const [location] = await db.select().from(locations).where(eq(locations.id, expense.location_id));
        const [paidByUser] = await db.select().from(users).where(eq(users.id, expense.paid_by_user_id));
        
        if (category && location && paidByUser) {
          expensesWithDetails.push({
            ...expense,
            category,
            location,
            paidByUser
          });
        }
      }
      
      return expensesWithDetails;
    } catch (error) {
      console.error(`Error getting expenses by month ${month}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getExpensesByMonth', error)) {
        return [];
      }
      throw error;
    }
  }

  async createExpense(expense: InsertExpense): Promise<ExpenseWithDetails> {
    try {
      // Ensure defaults
      const expenseToCreate = {
        ...expense,
        split_type: expense.split_type || "50/50",
        notes: expense.notes || null,
      };
      
      const [createdExpense] = await db.insert(expenses).values(expenseToCreate).returning();
      
      const expenseWithDetails = await this.getExpense(createdExpense.id);
      if (!expenseWithDetails) {
        throw new Error("Failed to create expense with details");
      }
      
      return expenseWithDetails;
    } catch (error) {
      console.error(`Error creating expense:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('createExpense', error)) {
        throw new Error(`Failed to create expense: ${error.message}`);
      }
      throw error;
    }
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined> {
    try {
      const [updatedExpense] = await db
        .update(expenses)
        .set(expense)
        .where(eq(expenses.id, id))
        .returning();
      
      return await this.getExpense(id);
    } catch (error) {
      console.error(`Error updating expense ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('updateExpense', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<boolean> {
    try {
      await db.delete(expenses).where(eq(expenses.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting expense ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('deleteExpense', error)) {
        return false;
      }
      throw error;
    }
  }

  async getRecurringExpense(id: number): Promise<RecurringExpenseWithDetails | undefined> {
    try {
      // Get recurring expense
      const [recurringExpense] = await db
        .select()
        .from(recurringExpenses)
        .where(eq(recurringExpenses.id, id));
      
      if (!recurringExpense) {
        return undefined;
      }
      
      // Get related data
      const [category] = await db.select().from(categories).where(eq(categories.id, recurringExpense.category_id));
      const [location] = await db.select().from(locations).where(eq(locations.id, recurringExpense.location_id));
      const [paidByUser] = await db.select().from(users).where(eq(users.id, recurringExpense.paid_by_user_id));
      
      if (!category || !location || !paidByUser) {
        return undefined;
      }
      
      return {
        ...recurringExpense,
        category,
        location,
        paidByUser
      };
    } catch (error) {
      console.error(`Error getting recurring expense ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getRecurringExpense', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async getAllRecurringExpenses(): Promise<RecurringExpenseWithDetails[]> {
    try {
      // Get all recurring expenses
      const allRecurringExpenses = await db
        .select()
        .from(recurringExpenses)
        .orderBy(desc(recurringExpenses.next_date));
      
      const recurringExpensesWithDetails: RecurringExpenseWithDetails[] = [];
      
      // Get related data for each recurring expense
      for (const recurringExpense of allRecurringExpenses) {
        const [category] = await db.select().from(categories).where(eq(categories.id, recurringExpense.category_id));
        const [location] = await db.select().from(locations).where(eq(locations.id, recurringExpense.location_id));
        const [paidByUser] = await db.select().from(users).where(eq(users.id, recurringExpense.paid_by_user_id));
        
        if (category && location && paidByUser) {
          recurringExpensesWithDetails.push({
            ...recurringExpense,
            category,
            location,
            paidByUser
          });
        }
      }
      
      return recurringExpensesWithDetails;
    } catch (error) {
      console.error(`Error getting all recurring expenses:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getAllRecurringExpenses', error)) {
        return [];
      }
      throw error;
    }
  }

  async getActiveRecurringExpenses(): Promise<RecurringExpenseWithDetails[]> {
    try {
      // Get active recurring expenses
      const activeRecurringExpenses = await db
        .select()
        .from(recurringExpenses)
        .where(eq(recurringExpenses.is_active, true))
        .orderBy(asc(recurringExpenses.next_date));
      
      const recurringExpensesWithDetails: RecurringExpenseWithDetails[] = [];
      
      // Get related data for each recurring expense
      for (const recurringExpense of activeRecurringExpenses) {
        const [category] = await db.select().from(categories).where(eq(categories.id, recurringExpense.category_id));
        const [location] = await db.select().from(locations).where(eq(locations.id, recurringExpense.location_id));
        const [paidByUser] = await db.select().from(users).where(eq(users.id, recurringExpense.paid_by_user_id));
        
        if (category && location && paidByUser) {
          recurringExpensesWithDetails.push({
            ...recurringExpense,
            category,
            location,
            paidByUser
          });
        }
      }
      
      return recurringExpensesWithDetails;
    } catch (error) {
      console.error(`Error getting active recurring expenses:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getActiveRecurringExpenses', error)) {
        return [];
      }
      throw error;
    }
  }

  async createRecurringExpense(recurringExpense: InsertRecurringExpense): Promise<RecurringExpenseWithDetails> {
    try {
      // Ensure defaults
      const recurringExpenseToCreate = {
        ...recurringExpense,
        split_type: recurringExpense.split_type || "50/50",
        notes: recurringExpense.notes || null,
        is_active: recurringExpense.is_active ?? true,
        end_date: recurringExpense.end_date || null
      };
      
      const [createdRecurringExpense] = await db
        .insert(recurringExpenses)
        .values(recurringExpenseToCreate)
        .returning();
      
      const recurringExpenseWithDetails = await this.getRecurringExpense(createdRecurringExpense.id);
      if (!recurringExpenseWithDetails) {
        throw new Error("Failed to create recurring expense with details");
      }
      
      return recurringExpenseWithDetails;
    } catch (error) {
      console.error(`Error creating recurring expense:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('createRecurringExpense', error)) {
        throw new Error(`Failed to create recurring expense: ${error.message}`);
      }
      throw error;
    }
  }

  async updateRecurringExpense(id: number, recurringExpense: Partial<InsertRecurringExpense>): Promise<RecurringExpenseWithDetails | undefined> {
    try {
      // Make sure end_date is properly handled
      const updateData = { ...recurringExpense };
      if ('end_date' in updateData) {
        updateData.end_date = updateData.end_date || null;
      }
      
      const [updatedRecurringExpense] = await db
        .update(recurringExpenses)
        .set(updateData)
        .where(eq(recurringExpenses.id, id))
        .returning();
      
      return await this.getRecurringExpense(id);
    } catch (error) {
      console.error(`Error updating recurring expense ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('updateRecurringExpense', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async deleteRecurringExpense(id: number): Promise<boolean> {
    try {
      await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting recurring expense ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('deleteRecurringExpense', error)) {
        return false;
      }
      throw error;
    }
  }

  async processRecurringExpenses(): Promise<ExpenseWithDetails[]> {
    try {
      const today = new Date();
      const activeRecurringExpenses = await this.getActiveRecurringExpenses();
      const createdExpenses: ExpenseWithDetails[] = [];
      
      for (const recurringExpense of activeRecurringExpenses) {
        const nextDate = new Date(recurringExpense.next_date);
        
        // Check if next_date is today or in the past
        if (nextDate <= today) {
          // Create a new expense based on the recurring expense
          const newExpense: InsertExpense = {
            description: recurringExpense.description,
            amount: recurringExpense.amount,
            date: nextDate,
            paid_by_user_id: recurringExpense.paid_by_user_id,
            split_type: recurringExpense.split_type,
            notes: recurringExpense.notes ? `${recurringExpense.notes} (Recurring: ${recurringExpense.name})` : `Recurring: ${recurringExpense.name}`,
            category_id: recurringExpense.category_id,
            location_id: recurringExpense.location_id
          };
          
          const createdExpense = await this.createExpense(newExpense);
          createdExpenses.push(createdExpense);
          
          // Calculate and update the next occurrence date
          const nextOccurrenceDate = this.calculateNextOccurrence(nextDate, recurringExpense.frequency);
          
          // Check if end_date is defined and next occurrence exceeds it
          if (recurringExpense.end_date && nextOccurrenceDate > new Date(recurringExpense.end_date)) {
            // Deactivate the recurring expense
            await this.updateRecurringExpense(recurringExpense.id, { is_active: false });
          } else {
            // Update the next_date
            await this.updateRecurringExpense(recurringExpense.id, { 
              next_date: nextOccurrenceDate 
            });
          }
        }
      }
      
      return createdExpenses;
    } catch (error) {
      console.error(`Error processing recurring expenses:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('processRecurringExpenses', error)) {
        return [];
      }
      throw error;
    }
  }

  private calculateNextOccurrence(currentDate: Date, frequency: string): Date {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'bi-weekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        // Default to monthly
        date.setMonth(date.getMonth() + 1);
    }
    
    return date;
  }

  async getSettlement(id: number): Promise<SettlementWithUsers | undefined> {
    try {
      // Get settlement
      const [settlement] = await db
        .select()
        .from(settlements)
        .where(eq(settlements.id, id));
      
      if (!settlement) {
        return undefined;
      }
      
      // Get related users
      const [fromUser] = await db.select().from(users).where(eq(users.id, settlement.from_user_id));
      const [toUser] = await db.select().from(users).where(eq(users.id, settlement.to_user_id));
      
      if (!fromUser || !toUser) {
        return undefined;
      }
      
      return {
        ...settlement,
        fromUser,
        toUser
      };
    } catch (error) {
      console.error(`Error getting settlement ${id}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getSettlement', error)) {
        return undefined;
      }
      throw error;
    }
  }

  async getAllSettlements(): Promise<SettlementWithUsers[]> {
    try {
      // Get all settlements
      const allSettlements = await db
        .select()
        .from(settlements)
        .orderBy(desc(settlements.date));
      
      const settlementsWithUsers: SettlementWithUsers[] = [];
      
      // Get related users for each settlement
      for (const settlement of allSettlements) {
        const [fromUser] = await db.select().from(users).where(eq(users.id, settlement.from_user_id));
        const [toUser] = await db.select().from(users).where(eq(users.id, settlement.to_user_id));
        
        if (fromUser && toUser) {
          settlementsWithUsers.push({
            ...settlement,
            fromUser,
            toUser
          });
        }
      }
      
      return settlementsWithUsers;
    } catch (error) {
      console.error(`Error getting all settlements:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getAllSettlements', error)) {
        return [];
      }
      throw error;
    }
  }

  async getSettlementsByMonth(month: string): Promise<SettlementWithUsers[]> {
    try {
      // Get settlements by month
      const monthSettlements = await db
        .select()
        .from(settlements)
        .where(eq(settlements.month, month))
        .orderBy(desc(settlements.date));
      
      const settlementsWithUsers: SettlementWithUsers[] = [];
      
      // Get related users for each settlement
      for (const settlement of monthSettlements) {
        const [fromUser] = await db.select().from(users).where(eq(users.id, settlement.from_user_id));
        const [toUser] = await db.select().from(users).where(eq(users.id, settlement.to_user_id));
        
        if (fromUser && toUser) {
          settlementsWithUsers.push({
            ...settlement,
            fromUser,
            toUser
          });
        }
      }
      
      return settlementsWithUsers;
    } catch (error) {
      console.error(`Error getting settlements by month ${month}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getSettlementsByMonth', error)) {
        return [];
      }
      throw error;
    }
  }

  async createSettlement(settlement: InsertSettlement): Promise<SettlementWithUsers> {
    try {
      const [createdSettlement] = await db
        .insert(settlements)
        .values(settlement)
        .returning();
      
      const settlementWithUsers = await this.getSettlement(createdSettlement.id);
      if (!settlementWithUsers) {
        throw new Error("Failed to create settlement with users");
      }
      
      return settlementWithUsers;
    } catch (error) {
      console.error(`Error creating settlement:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('createSettlement', error)) {
        throw new Error(`Failed to create settlement: ${error.message}`);
      }
      throw error;
    }
  }

  async getMonthSummary(month: string): Promise<MonthSummary> {
    try {
      // Get expenses for the month
      const monthExpenses = await this.getExpensesByMonth(month);
      
      // Calculate total expenses
      const totalExpenses = monthExpenses.reduce((total, expense) => total + Number(expense.amount), 0);
      
      // Get all users
      const allUsers = await this.getAllUsers();
      
      // Calculate user expenses
      const userExpenses: Record<number, number> = {};
      for (const user of allUsers) {
        userExpenses[user.id] = 0;
      }
      
      // Calculate the expenses
      for (const expense of monthExpenses) {
        const paidById = expense.paidByUser.id;
        const amount = Number(expense.amount);
        
        if (expense.split_type === "50/50") {
          // Add half to the person who paid (they already paid the full amount)
          userExpenses[paidById] += amount / 2;
          
          // Determine the other user
          const otherUserId = allUsers.find(u => u.id !== paidById)?.id;
          if (otherUserId) {
            // Add half to the other person (they owe this amount)
            userExpenses[otherUserId] -= amount / 2;
          }
        } else if (expense.split_type === "100%") {
          // Add full amount to the person who paid
          userExpenses[paidById] += 0;
          
          // Determine the other user
          const otherUserId = allUsers.find(u => u.id !== paidById)?.id;
          if (otherUserId) {
            // The other person owes the full amount
            userExpenses[otherUserId] -= amount;
          }
        }
      }
      
      // Category totals
      const categoryTotals: Record<number, number> = {};
      for (const expense of monthExpenses) {
        const categoryId = expense.category.id;
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = 0;
        }
        categoryTotals[categoryId] += Number(expense.amount);
      }
      
      // Format category totals
      const formattedCategoryTotals = Object.entries(categoryTotals).map(([categoryId, amount]) => {
        const category = monthExpenses.find(e => e.category.id === Number(categoryId))?.category;
        if (!category) return null;
        
        return {
          category,
          amount,
          percentage: this.calculatePercent(amount, totalExpenses)
        };
      }).filter(Boolean) as Array<{
        category: Category;
        amount: number;
        percentage: number;
      }>;
      
      // Location totals
      const locationTotals: Record<number, number> = {};
      for (const expense of monthExpenses) {
        const locationId = expense.location.id;
        if (!locationTotals[locationId]) {
          locationTotals[locationId] = 0;
        }
        locationTotals[locationId] += Number(expense.amount);
      }
      
      // Format location totals
      const formattedLocationTotals = Object.entries(locationTotals).map(([locationId, amount]) => {
        const location = monthExpenses.find(e => e.location.id === Number(locationId))?.location;
        if (!location) return null;
        
        return {
          location,
          amount,
          percentage: this.calculatePercent(amount, totalExpenses)
        };
      }).filter(Boolean) as Array<{
        location: Location;
        amount: number;
        percentage: number;
      }>;
      
      // Split type totals
      const splitTypeTotals: Record<string, number> = {
        "50/50": 0,
        "100%": 0
      };
      
      for (const expense of monthExpenses) {
        splitTypeTotals[expense.split_type] += Number(expense.amount);
      }
      
      // Date distribution
      const dateDistribution: Record<string, number> = {};
      for (const expense of monthExpenses) {
        const date = new Date(expense.date);
        const day = date.getDate().toString();
        
        if (!dateDistribution[day]) {
          dateDistribution[day] = 0;
        }
        
        dateDistribution[day] += Number(expense.amount);
      }
      
      // Settlement calculation
      let settlementAmount = 0;
      let fromUserId = 0;
      let toUserId = 0;
      
      // Find which user owes money to the other
      const userIds = Object.keys(userExpenses).map(Number);
      if (userIds.length >= 2) {
        const user1Id = userIds[0];
        const user2Id = userIds[1];
        
        const user1Balance = userExpenses[user1Id];
        const user2Balance = userExpenses[user2Id];
        
        if (user1Balance < 0) {
          // User 1 owes money to User 2
          fromUserId = user1Id;
          toUserId = user2Id;
          settlementAmount = Math.abs(user1Balance);
        } else if (user2Balance < 0) {
          // User 2 owes money to User 1
          fromUserId = user2Id;
          toUserId = user1Id;
          settlementAmount = Math.abs(user2Balance);
        }
        // If both balances are 0 or positive, no settlement needed
      }
      
      return {
        month,
        totalExpenses,
        userExpenses,
        categoryTotals: formattedCategoryTotals,
        locationTotals: formattedLocationTotals,
        splitTypeTotals,
        dateDistribution,
        settlementAmount,
        settlementDirection: {
          fromUserId,
          toUserId
        }
      };
    } catch (error) {
      console.error(`Error getting month summary for ${month}:`, error);
      if (this.onStorageOperationError && this.onStorageOperationError('getMonthSummary', error)) {
        // Return a placeholder summary
        return {
          month,
          totalExpenses: 0,
          userExpenses: {},
          categoryTotals: [],
          locationTotals: [],
          splitTypeTotals: { "50/50": 0, "100%": 0 },
          dateDistribution: {},
          settlementAmount: 0,
          settlementDirection: {
            fromUserId: 0,
            toUserId: 0
          }
        };
      }
      throw error;
    }
  }
  
  private calculatePercent(value: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return Math.round((value / total) * 100);
  }
}

// By default, use in-memory storage
export const storage = new MemStorage();
