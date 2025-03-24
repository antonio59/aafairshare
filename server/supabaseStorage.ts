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
import { IStorage } from "./storage";
import { supabase } from "./supabase";

export class SupabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw new Error(`Failed to get users: ${error.message}`);
    return data as User[];
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Category;
  }

  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) throw new Error(`Failed to get categories: ${error.message}`);
    return data as Category[];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create category: ${error.message}`);
    return data as Category;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Location operations
  async getLocation(id: number): Promise<Location | undefined> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Location;
  }

  async getAllLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*');
    
    if (error) throw new Error(`Failed to get locations: ${error.message}`);
    return data as Location[];
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create location: ${error.message}`);
    return data as Location;
  }

  async updateLocation(id: number, location: Partial<InsertLocation>): Promise<Location | undefined> {
    const { data, error } = await supabase
      .from('locations')
      .update(location)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Location;
  }

  async deleteLocation(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Expense operations
  async getExpense(id: number): Promise<ExpenseWithDetails | undefined> {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:categories(*),
        location:locations(*),
        paidByUser:users(*)
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    // Transform the nested data to match ExpenseWithDetails
    return {
      ...data,
      category: data.category,
      location: data.location,
      paidByUser: data.paidByUser
    } as unknown as ExpenseWithDetails;
  }

  async getAllExpenses(): Promise<ExpenseWithDetails[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:categories(*),
        location:locations(*),
        paidByUser:users(*)
      `)
      .order('date', { ascending: false });
    
    if (error) throw new Error(`Failed to get expenses: ${error.message}`);
    
    // Transform the nested data to match ExpenseWithDetails
    return data.map(expense => ({
      ...expense,
      category: expense.category,
      location: expense.location,
      paidByUser: expense.paidByUser
    })) as unknown as ExpenseWithDetails[];
  }

  async getExpensesByMonth(month: string): Promise<ExpenseWithDetails[]> {
    // For Postgres, we need to use a date range for the month
    const [year, monthNum] = month.split('-').map(part => parseInt(part));
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of the month
    
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        category:categories(*),
        location:locations(*),
        paidByUser:users(*)
      `)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });
    
    if (error) throw new Error(`Failed to get expenses by month: ${error.message}`);
    
    // Transform the nested data to match ExpenseWithDetails
    return data.map(expense => ({
      ...expense,
      category: expense.category,
      location: expense.location,
      paidByUser: expense.paidByUser
    })) as unknown as ExpenseWithDetails[];
  }

  async createExpense(expense: InsertExpense): Promise<ExpenseWithDetails> {
    // Ensure split_type is always defined with a default value if needed
    const expenseToCreate = { 
      ...expense, 
      split_type: expense.split_type || "50/50",
      notes: expense.notes || null
    };
    
    const { data, error } = await supabase
      .from('expenses')
      .insert(expenseToCreate)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create expense: ${error.message}`);
    
    // Get the full expense with details
    const expenseWithDetails = await this.getExpense(data.id as number);
    if (!expenseWithDetails) {
      throw new Error("Failed to create expense with details");
    }
    
    return expenseWithDetails;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined> {
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    
    // Get the updated expense with details
    return this.getExpense(id);
  }

  async deleteExpense(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  // Recurring Expense operations
  async getRecurringExpense(id: number): Promise<RecurringExpenseWithDetails | undefined> {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select(`
        *,
        category:categories(*),
        location:locations(*),
        paidByUser:users(*)
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    // Transform the nested data to match RecurringExpenseWithDetails
    return {
      ...data,
      category: data.category,
      location: data.location,
      paidByUser: data.paidByUser
    } as unknown as RecurringExpenseWithDetails;
  }

  async getAllRecurringExpenses(): Promise<RecurringExpenseWithDetails[]> {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select(`
        *,
        category:categories(*),
        location:locations(*),
        paidByUser:users(*)
      `)
      .order('next_date', { ascending: false });
    
    if (error) throw new Error(`Failed to get recurring expenses: ${error.message}`);
    
    // Transform the nested data to match RecurringExpenseWithDetails
    return data.map(expense => ({
      ...expense,
      category: expense.category,
      location: expense.location,
      paidByUser: expense.paidByUser
    })) as unknown as RecurringExpenseWithDetails[];
  }

  async getActiveRecurringExpenses(): Promise<RecurringExpenseWithDetails[]> {
    const { data, error } = await supabase
      .from('recurring_expenses')
      .select(`
        *,
        category:categories(*),
        location:locations(*),
        paidByUser:users(*)
      `)
      .eq('is_active', true)
      .order('next_date', { ascending: false });
    
    if (error) throw new Error(`Failed to get active recurring expenses: ${error.message}`);
    
    // Transform the nested data to match RecurringExpenseWithDetails
    return data.map(expense => ({
      ...expense,
      category: expense.category,
      location: expense.location,
      paidByUser: expense.paidByUser
    })) as unknown as RecurringExpenseWithDetails[];
  }

  async createRecurringExpense(recurringExpense: InsertRecurringExpense): Promise<RecurringExpenseWithDetails> {
    // Ensure that split_type and is_active are always defined with default values if needed
    const recurringExpenseToCreate = { 
      ...recurringExpense, 
      split_type: recurringExpense.split_type || "50/50",
      notes: recurringExpense.notes || null,
      is_active: recurringExpense.is_active ?? true,
      // Ensure end_date is either a Date or null, not undefined
      end_date: recurringExpense.end_date || null
    };
    
    const { data, error } = await supabase
      .from('recurring_expenses')
      .insert(recurringExpenseToCreate)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create recurring expense: ${error.message}`);
    
    // Get the full recurring expense with details
    const recurringExpenseWithDetails = await this.getRecurringExpense(data.id);
    if (!recurringExpenseWithDetails) {
      throw new Error("Failed to create recurring expense with details");
    }
    
    return recurringExpenseWithDetails;
  }

  async updateRecurringExpense(id: number, recurringExpense: Partial<InsertRecurringExpense>): Promise<RecurringExpenseWithDetails | undefined> {
    // Make a copy of the recurringExpense object to avoid mutating the input
    const updatedData = { ...recurringExpense };
    
    // Make sure end_date is either a Date or null, not undefined
    if ('end_date' in updatedData) {
      updatedData.end_date = updatedData.end_date || null;
    }
    
    const { data, error } = await supabase
      .from('recurring_expenses')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    
    // Get the updated recurring expense with details
    return this.getRecurringExpense(id);
  }

  async deleteRecurringExpense(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id);
    
    return !error;
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
        nextDate.setMonth(nextDate.getMonth() + 1); // Default to monthly
    }
    
    return nextDate;
  }

  // Settlement operations
  async getSettlement(id: number): Promise<SettlementWithUsers | undefined> {
    const { data, error } = await supabase
      .from('settlements')
      .select(`
        *,
        fromUser:users!from_user_id(*),
        toUser:users!to_user_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    
    // Transform the nested data to match SettlementWithUsers
    return {
      ...data,
      fromUser: data.fromUser,
      toUser: data.toUser
    } as unknown as SettlementWithUsers;
  }

  async getAllSettlements(): Promise<SettlementWithUsers[]> {
    const { data, error } = await supabase
      .from('settlements')
      .select(`
        *,
        fromUser:users!from_user_id(*),
        toUser:users!to_user_id(*)
      `)
      .order('settled_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get settlements: ${error.message}`);
    
    // Transform the nested data to match SettlementWithUsers
    return data.map(settlement => ({
      ...settlement,
      fromUser: settlement.fromUser,
      toUser: settlement.toUser
    })) as unknown as SettlementWithUsers[];
  }

  async getSettlementsByMonth(month: string): Promise<SettlementWithUsers[]> {
    const { data, error } = await supabase
      .from('settlements')
      .select(`
        *,
        fromUser:users!from_user_id(*),
        toUser:users!to_user_id(*)
      `)
      .eq('month', month)
      .order('settled_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get settlements by month: ${error.message}`);
    
    // Transform the nested data to match SettlementWithUsers
    return data.map(settlement => ({
      ...settlement,
      fromUser: settlement.fromUser,
      toUser: settlement.toUser
    })) as unknown as SettlementWithUsers[];
  }

  async createSettlement(settlement: InsertSettlement): Promise<SettlementWithUsers> {
    const { data, error } = await supabase
      .from('settlements')
      .insert(settlement)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create settlement: ${error.message}`);
    
    // Get the full settlement with details
    const settlementWithDetails = await this.getSettlement(data.id);
    if (!settlementWithDetails) {
      throw new Error("Failed to create settlement with details");
    }
    
    return settlementWithDetails;
  }

  // Summary operations
  async getMonthSummary(month: string): Promise<MonthSummary> {
    // Get expenses for the month
    const monthExpenses = await this.getExpensesByMonth(month);
    
    // Calculate total expenses
    const totalExpenses = monthExpenses.reduce((total, expense) => total + Number(expense.amount), 0);
    
    // Calculate user expenses
    const userExpenses: Record<number, number> = {};
    for (const expense of monthExpenses) {
      const paidById = expense.paid_by;
      
      if (!userExpenses[paidById]) {
        userExpenses[paidById] = 0;
      }
      
      if (expense.split_type === "50/50") {
        // Add 50% to the person who paid
        userExpenses[paidById] += Number(expense.amount) / 2;
      } else {
        // Add 100% to the person who paid
        userExpenses[paidById] += Number(expense.amount);
      }
    }
    
    // Calculate category totals
    const categoryAmounts: Record<number, number> = {};
    const categories: Record<number, Category> = {};
    
    for (const expense of monthExpenses) {
      const categoryId = expense.category_id;
      if (!categoryAmounts[categoryId]) {
        categoryAmounts[categoryId] = 0;
        categories[categoryId] = expense.category;
      }
      categoryAmounts[categoryId] += Number(expense.amount);
    }
    
    const categoryTotals = Object.keys(categoryAmounts).map((categoryId) => {
      const id = parseInt(categoryId);
      return {
        category: categories[id],
        amount: categoryAmounts[id],
        percentage: this.calculatePercent(categoryAmounts[id], totalExpenses)
      };
    }).sort((a, b) => b.amount - a.amount);
    
    // Calculate location totals
    const locationAmounts: Record<number, number> = {};
    const locations: Record<number, Location> = {};
    
    for (const expense of monthExpenses) {
      const locationId = expense.location_id;
      if (!locationAmounts[locationId]) {
        locationAmounts[locationId] = 0;
        locations[locationId] = expense.location;
      }
      locationAmounts[locationId] += Number(expense.amount);
    }
    
    const locationTotals = Object.keys(locationAmounts).map((locationId) => {
      const id = parseInt(locationId);
      return {
        location: locations[id],
        amount: locationAmounts[id],
        percentage: this.calculatePercent(locationAmounts[id], totalExpenses)
      };
    }).sort((a, b) => b.amount - a.amount);
    
    // Calculate split type totals
    const splitTypeTotals: Record<string, number> = {};
    for (const expense of monthExpenses) {
      const splitType = expense.split_type;
      if (!splitTypeTotals[splitType]) {
        splitTypeTotals[splitType] = 0;
      }
      splitTypeTotals[splitType] += Number(expense.amount);
    }
    
    // Calculate date distribution
    const dateDistribution: Record<string, number> = {};
    for (const expense of monthExpenses) {
      const date = new Date(expense.date);
      const day = String(date.getDate()).padStart(2, '0');
      if (!dateDistribution[day]) {
        dateDistribution[day] = 0;
      }
      dateDistribution[day] += Number(expense.amount);
    }
    
    // Calculate settlement amount and direction
    const users = await this.getAllUsers();
    if (users.length < 2) {
      throw new Error("Need at least 2 users to calculate settlement");
    }
    
    const user1Id = users[0].id;
    const user2Id = users[1].id;
    
    const user1Paid = monthExpenses
      .filter(expense => expense.paid_by === user1Id)
      .reduce((total, expense) => total + Number(expense.amount), 0);
    
    const user2Paid = monthExpenses
      .filter(expense => expense.paid_by === user2Id)
      .reduce((total, expense) => total + Number(expense.amount), 0);
    
    // Calculate the 50/50 split (how much each should pay)
    const eachShouldPay = totalExpenses / 2;
    
    // Calculate what user1 actually paid for user2
    const user1PaidForUser2 = monthExpenses
      .filter(expense => expense.paid_by === user1Id && expense.split_type === "50/50")
      .reduce((total, expense) => total + Number(expense.amount) / 2, 0);
    
    // Calculate what user2 actually paid for user1
    const user2PaidForUser1 = monthExpenses
      .filter(expense => expense.paid_by === user2Id && expense.split_type === "50/50")
      .reduce((total, expense) => total + Number(expense.amount) / 2, 0);
    
    // Calculate the final settlement amount
    let settlementAmount = Math.abs(user1PaidForUser2 - user2PaidForUser1);
    settlementAmount = parseFloat(settlementAmount.toFixed(2)); // Round to 2 decimal places
    
    // Determine who needs to pay whom
    const fromUserId = user1PaidForUser2 > user2PaidForUser1 ? user2Id : user1Id;
    const toUserId = fromUserId === user1Id ? user2Id : user1Id;
    
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
  
  // Helper function to calculate percentage
  private calculatePercent(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}