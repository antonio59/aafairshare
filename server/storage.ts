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
  MonthSummary
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
    const john: InsertUser = { username: "John", password: "password" };
    const sarah: InsertUser = { username: "Sarah", password: "password" };
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
    const paidByUser = await this.getUser(expense.paid_by);
    
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
      const paidByUser = await this.getUser(expense.paid_by);
      
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
    // Ensure that split_type is always defined with a default value if needed
    const expense = { 
      ...insertExpense, 
      id,
      split_type: insertExpense.split_type || "50/50",
      notes: insertExpense.notes || null
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
    const paidByUser = await this.getUser(recurringExpense.paid_by);
    
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
      const paidByUser = await this.getUser(recurringExpense.paid_by);
      
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
          paid_by: recurringExpense.paid_by,
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
      return new Date(b.settled_at).getTime() - new Date(a.settled_at).getTime();
    });
  }

  async getSettlementsByMonth(month: string): Promise<SettlementWithUsers[]> {
    const allSettlements = await this.getAllSettlements();
    return allSettlements.filter(settlement => settlement.month === month);
  }

  async createSettlement(insertSettlement: InsertSettlement): Promise<SettlementWithUsers> {
    const id = this.settlementIdCounter++;
    const settlement = { ...insertSettlement, id };
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
        .filter(expense => expense.paid_by === user.id)
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
          if (expense.paid_by === user1.id) {
            // User 1 paid, but User 2 owes 100%
            user2Share += amount;
          } else if (expense.paid_by === user2.id) {
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

export const storage = new MemStorage();
