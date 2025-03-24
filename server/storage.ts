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
  
  private userIdCounter: number;
  private categoryIdCounter: number;
  private locationIdCounter: number;
  private expenseIdCounter: number;
  private settlementIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.locations = new Map();
    this.expenses = new Map();
    this.settlements = new Map();
    
    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.locationIdCounter = 1;
    this.expenseIdCounter = 1;
    this.settlementIdCounter = 1;
    
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
    const expense = { ...insertExpense, id };
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
    
    // Calculate settlement amount and direction
    let settlementAmount = 0;
    let fromUserId = 0;
    let toUserId = 0;
    
    if (users.length >= 2) {
      const user1 = users[0];
      const user2 = users[1];
      
      const user1Paid = userExpenses[user1.id] || 0;
      const user2Paid = userExpenses[user2.id] || 0;
      
      const user1Share = totalExpenses / 2;
      const user2Share = totalExpenses / 2;
      
      const user1Balance = user1Paid - user1Share;
      const user2Balance = user2Paid - user2Share;
      
      if (user1Balance > 0) {
        // User 1 paid more, so User 2 owes User 1
        settlementAmount = Math.abs(user1Balance);
        fromUserId = user2.id;
        toUserId = user1.id;
      } else {
        // User 2 paid more, so User 1 owes User 2
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
      settlementAmount,
      settlementDirection: {
        fromUserId,
        toUserId
      }
    };
  }
}

export const storage = new MemStorage();
