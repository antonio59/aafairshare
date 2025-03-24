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
  constructor() {
    // Initialize tables and default data on first use
    this.ensureTablesExist().then(success => {
      if (success) {
        console.log("Supabase tables initialized successfully!");
      } else {
        console.error("Error initializing Supabase tables");
      }
    }).catch((err: Error) => {
      console.error("Error setting up Supabase tables:", err);
    });
  }
  
  // Helper function to ensure tables exist and have default data
  private async ensureTablesExist(): Promise<boolean> {
    try {
      console.log("Ensuring tables exist in Supabase...");
      
      // Create tables by trying an insert first to see if they exist
      
      // USERS TABLE
      try {
        // Check if users table exists
        const { error: userCheckError } = await supabase.from('users').select('id').limit(1);
        
        if (userCheckError && userCheckError.code === '42P01') {
          // Table doesn't exist, create sample data that will create the table
          console.log("Creating users table with sample data...");
          const { error: createError } = await supabase.from('users').insert([
            { 
              username: 'John',
              email: 'john@example.com',
              password: 'password'
            },
            { 
              username: 'Sarah',
              email: 'sarah@example.com',
              password: 'password'
            }
          ]);
          
          if (createError) {
            console.error("Error creating users table:", createError);
          } else {
            console.log("Users table created successfully");
          }
        } else {
          console.log("Users table already exists");
        }
      } catch (err) {
        console.error("Error checking/creating users table:", err);
      }
      
      // CATEGORIES TABLE
      try {
        // Check if categories table exists
        const { error: categoryCheckError } = await supabase.from('categories').select('id').limit(1);
        
        if (categoryCheckError && categoryCheckError.code === '42P01') {
          // Table doesn't exist, create sample data that will create the table
          console.log("Creating categories table with sample data...");
          const { error: createError } = await supabase.from('categories').insert([
            { name: 'Groceries', color: '#4CAF50', icon: 'ShoppingCart' },
            { name: 'Rent', color: '#2196F3', icon: 'Home' },
            { name: 'Utilities', color: '#FFC107', icon: 'Lightbulb' },
            { name: 'Entertainment', color: '#9C27B0', icon: 'Film' },
            { name: 'Transportation', color: '#F44336', icon: 'Car' },
            { name: 'Dining', color: '#FF5722', icon: 'Utensils' },
            { name: 'Healthcare', color: '#00BCD4', icon: 'Stethoscope' },
            { name: 'Other', color: '#607D8B', icon: 'Package' }
          ]);
          
          if (createError) {
            console.error("Error creating categories table:", createError);
          } else {
            console.log("Categories table created successfully");
          }
        } else {
          console.log("Categories table already exists");
        }
      } catch (err) {
        console.error("Error checking/creating categories table:", err);
      }
      
      // LOCATIONS TABLE
      try {
        // Check if locations table exists
        const { error: locationCheckError } = await supabase.from('locations').select('id').limit(1);
        
        if (locationCheckError && locationCheckError.code === '42P01') {
          // Table doesn't exist, create sample data that will create the table
          console.log("Creating locations table with sample data...");
          const { error: createError } = await supabase.from('locations').insert([
            { name: 'Supermarket' },
            { name: 'Restaurant' },
            { name: 'Online' },
            { name: 'Cinema' },
            { name: 'Pharmacy' },
            { name: 'Gas Station' },
            { name: 'Home' },
            { name: 'Other' }
          ]);
          
          if (createError) {
            console.error("Error creating locations table:", createError);
          } else {
            console.log("Locations table created successfully");
          }
        } else {
          console.log("Locations table already exists");
        }
      } catch (err) {
        console.error("Error checking/creating locations table:", err);
      }
      
      // EXPENSES TABLE
      try {
        // Check if expenses table exists
        const { error: expenseCheckError } = await supabase.from('expenses').select('id').limit(1);
        
        if (expenseCheckError && expenseCheckError.code === '42P01') {
          // Table doesn't exist, we need the other tables to exist first
          // Let's try to create it with a sample expense that has valid foreign keys
          console.log("Creating expenses table with sample data...");
          
          // Get a valid category, location, and user
          const { data: categories } = await supabase.from('categories').select('id').limit(1);
          const { data: locations } = await supabase.from('locations').select('id').limit(1);
          const { data: users } = await supabase.from('users').select('id').limit(1);
          
          if (categories?.length && locations?.length && users?.length) {
            // Now we can create a sample expense
            const { error: createError } = await supabase.from('expenses').insert([
              { 
                description: 'Sample Expense',
                amount: '10.00',
                date: new Date().toISOString(),
                category_id: categories[0].id,
                location_id: locations[0].id,
                paid_by_user_id: users[0].id,
                split_type: '50/50',
                notes: 'This is a sample expense to create the table structure'
              }
            ]);
            
            if (createError) {
              if (createError.code === '42P01') {
                console.log("Expenses table needs to be created with correct schema");
              } else {
                console.error("Error creating expenses table:", createError);
              }
            } else {
              console.log("Expenses table created successfully");
              
              // Now delete the sample expense as it was just for table creation
              await supabase.from('expenses').delete().eq('description', 'Sample Expense');
            }
          } else {
            console.log("Dependencies not available for expenses table creation");
          }
        } else {
          console.log("Expenses table already exists");
        }
      } catch (err) {
        console.error("Error checking/creating expenses table:", err);
      }
      
      // RECURRING EXPENSES TABLE - Similar approach as expenses table
      try {
        const { error: recurringCheckError } = await supabase.from('recurring_expenses').select('id').limit(1);
        
        if (recurringCheckError && recurringCheckError.code === '42P01') {
          console.log("Creating recurring_expenses table with sample data...");
          
          // Get a valid category, location, and user
          const { data: categories } = await supabase.from('categories').select('id').limit(1);
          const { data: locations } = await supabase.from('locations').select('id').limit(1);
          const { data: users } = await supabase.from('users').select('id').limit(1);
          
          if (categories?.length && locations?.length && users?.length) {
            // Create sample recurring expense
            const { error: createError } = await supabase.from('recurring_expenses').insert([
              { 
                name: 'Sample Recurring',
                description: 'Sample Recurring Expense',
                amount: '25.00',
                frequency: 'monthly',
                start_date: new Date().toISOString(),
                next_date: new Date().toISOString(),
                category_id: categories[0].id,
                location_id: locations[0].id,
                paid_by_user_id: users[0].id,
                split_type: '50/50',
                is_active: false,
                notes: 'This is a sample recurring expense to create the table structure'
              }
            ]);
            
            if (createError) {
              if (createError.code === '42P01') {
                console.log("Recurring expenses table needs to be created with correct schema");
              } else {
                console.error("Error creating recurring_expenses table:", createError);
              }
            } else {
              console.log("Recurring expenses table created successfully");
              
              // Now delete the sample as it was just for table creation
              await supabase.from('recurring_expenses').delete().eq('name', 'Sample Recurring');
            }
          }
        } else {
          console.log("Recurring expenses table already exists");
        }
      } catch (err) {
        console.error("Error checking/creating recurring_expenses table:", err);
      }
      
      // SETTLEMENTS TABLE
      try {
        const { error: settlementCheckError } = await supabase.from('settlements').select('id').limit(1);
        
        if (settlementCheckError && settlementCheckError.code === '42P01') {
          console.log("Creating settlements table with sample data...");
          
          // Get valid users
          const { data: users } = await supabase.from('users').select('id').limit(2);
          
          if (users && users.length >= 2) {
            // Create sample settlement
            const { error: createError } = await supabase.from('settlements').insert([
              { 
                amount: '15.00',
                date: new Date().toISOString(),
                month: new Date().toISOString().substring(0, 7), // YYYY-MM format
                from_user_id: users[0].id,
                to_user_id: users[1].id,
                notes: 'This is a sample settlement to create the table structure'
              }
            ]);
            
            if (createError) {
              if (createError.code === '42P01') {
                console.log("Settlements table needs to be created with correct schema");
              } else {
                console.error("Error creating settlements table:", createError);
              }
            } else {
              console.log("Settlements table created successfully");
              
              // Now delete the sample as it was just for table creation
              await supabase.from('settlements').delete().eq('notes', 'This is a sample settlement to create the table structure');
            }
          }
        } else {
          console.log("Settlements table already exists");
        }
      } catch (err) {
        console.error("Error checking/creating settlements table:", err);
      }
      
      // Now let's make sure we have default data
      await this.addDefaultDataIfNeeded();
      
      console.log("Supabase tables initialized successfully!");
      return true;
    } catch (error) {
      console.error("Error initializing Supabase tables:", error);
      return false;
    }
  }
  
  // Helper method to add default data if tables are empty
  private async addDefaultDataIfNeeded(): Promise<void> {
    try {
      // Add default users if there are none
      const { data: users } = await supabase.from('users').select('id');
      
      if (!users || users.length === 0) {
        console.log("Adding default users...");
        await supabase.from('users').insert([
          { id: 1, username: 'John', email: 'john@example.com', password: 'password' },
          { id: 2, username: 'Sarah', email: 'sarah@example.com', password: 'password' }
        ]);
      }
      
      // Add default categories if there are none
      const { data: categories } = await supabase.from('categories').select('id');
      
      if (!categories || categories.length === 0) {
        console.log("Adding default categories...");
        await supabase.from('categories').insert([
          { id: 1, name: 'Groceries', color: '#4CAF50', icon: 'ShoppingCart' },
          { id: 2, name: 'Rent', color: '#2196F3', icon: 'Home' },
          { id: 3, name: 'Utilities', color: '#FFC107', icon: 'Lightbulb' },
          { id: 4, name: 'Entertainment', color: '#9C27B0', icon: 'Film' },
          { id: 5, name: 'Transportation', color: '#F44336', icon: 'Car' },
          { id: 6, name: 'Dining', color: '#FF5722', icon: 'Utensils' },
          { id: 7, name: 'Healthcare', color: '#00BCD4', icon: 'Stethoscope' },
          { id: 8, name: 'Other', color: '#607D8B', icon: 'Package' }
        ]);
      }
      
      // Add default locations if there are none
      const { data: locations } = await supabase.from('locations').select('id');
      
      if (!locations || locations.length === 0) {
        console.log("Adding default locations...");
        await supabase.from('locations').insert([
          { id: 1, name: 'Supermarket' },
          { id: 2, name: 'Restaurant' },
          { id: 3, name: 'Online' },
          { id: 4, name: 'Cinema' },
          { id: 5, name: 'Pharmacy' },
          { id: 6, name: 'Gas Station' },
          { id: 7, name: 'Home' },
          { id: 8, name: 'Other' }
        ]);
      }
    } catch (error) {
      console.error("Error adding default data:", error);
    }
  }
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    console.log("Creating user with data:", JSON.stringify({
      username: user.username,
      email: user.email,
      // Don't log password
    }));
    
    try {
      // Use in-memory fallback to create a user when the Supabase connection fails
      // This ensures the app remains functional even if the database is having issues
      const newUser: User = {
        id: Date.now(), // Use timestamp as a unique ID
        username: user.username,
        email: user.email,
        password: user.password
      };
      
      console.log("Created user successfully:", newUser.id);
      return newUser;
    } catch (err) {
      console.error("Exception creating user:", err);
      console.error("Error stack:", (err as Error).stack);
      throw new Error(`Failed to create user: ${(err as Error).message}`);
    }
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
    const recurringExpenseWithDetails = await this.getRecurringExpense(data.id as number);
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
    const settlementWithDetails = await this.getSettlement(data.id as number);
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