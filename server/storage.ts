import { Pool } from 'pg';
import { 
  User, InsertUser, Category, InsertCategory, 
  Location, InsertLocation, Expense, InsertExpense,
  ExpenseWithDetails, Settlement, InsertSettlement,
  SettlementWithUsers, RecurringExpense, InsertRecurringExpense,
  RecurringExpenseWithDetails, MonthSummary
} from '@shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class Storage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [user.username, user.email, user.password]
    );
    return result.rows[0];
  }

  async getAllUsers(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const result = await pool.query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async getAllCategories(): Promise<Category[]> {
    const result = await pool.query('SELECT * FROM categories');
    return result.rows;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await pool.query(
      'INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) RETURNING *',
      [category.name, category.icon, category.color]
    );
    return result.rows[0];
  }

  async updateCategory(id: number, updatedCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await pool.query(
      'UPDATE categories SET name = $1, icon = $2, color = $3 WHERE id = $4 RETURNING *',
      [updatedCategory.name, updatedCategory.icon, updatedCategory.color, id]
    );
    return result.rows[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return result.rowCount > 0;
  }


  // Location operations
  async getLocation(id: number): Promise<Location | undefined> {
    const result = await pool.query(
      'SELECT * FROM locations WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async getAllLocations(): Promise<Location[]> {
    const result = await pool.query('SELECT * FROM locations');
    return result.rows;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const result = await pool.query(
      'INSERT INTO locations (name) VALUES ($1) RETURNING *',
      [location.name]
    );
    return result.rows[0];
  }

  async updateLocation(id: number, updatedLocation: Partial<InsertLocation>): Promise<Location | undefined> {
    const result = await pool.query(
      'UPDATE locations SET name = $1 WHERE id = $2 RETURNING *',
      [updatedLocation.name, id]
    );
    return result.rows[0];
  }

  async deleteLocation(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM locations WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Expense operations
  async getExpense(id: number): Promise<ExpenseWithDetails | undefined> {
    const result = await pool.query(
      `SELECT 
        e.*, 
        c.*, 
        l.*, 
        u.* 
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       JOIN locations l ON e.location_id = l.id
       JOIN users u ON e.paid_by_user_id = u.id
       WHERE e.id = $1`,
      [id]
    );
    const row = result.rows[0];
    return row ? { ...row, category: {id: row.category_id, name: row.name, icon: row.icon, color: row.color}, location: {id: row.location_id, name: row.name}, paidByUser: {id: row.paid_by_user_id, username: row.username, email: row.email, password: row.password}} : undefined;
  }

  async getAllExpenses(): Promise<ExpenseWithDetails[]> {
    const result = await pool.query(
      `SELECT 
        e.*, 
        c.*, 
        l.*, 
        u.* 
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       JOIN locations l ON e.location_id = l.id
       JOIN users u ON e.paid_by_user_id = u.id`
    );
    return result.rows.map(row => ({ ...row, category: {id: row.category_id, name: row.name, icon: row.icon, color: row.color}, location: {id: row.location_id, name: row.name}, paidByUser: {id: row.paid_by_user_id, username: row.username, email: row.email, password: row.password}}));
  }

  async getExpensesByMonth(month: string): Promise<ExpenseWithDetails[]> {
      const result = await pool.query(
        `SELECT 
          e.*, 
          c.*, 
          l.*, 
          u.* 
         FROM expenses e
         JOIN categories c ON e.category_id = c.id
         JOIN locations l ON e.location_id = l.id
         JOIN users u ON e.paid_by_user_id = u.id
         WHERE DATE_TRUNC('month', e.date) = DATE_TRUNC('month', $1::date)`,
        [month]
      );
      return result.rows.map(row => ({ ...row, category: {id: row.category_id, name: row.name, icon: row.icon, color: row.color}, location: {id: row.location_id, name: row.name}, paidByUser: {id: row.paid_by_user_id, username: row.username, email: row.email, password: row.password}}));
  }

  async createExpense(expense: InsertExpense): Promise<ExpenseWithDetails> {
    const result = await pool.query(
      `INSERT INTO expenses (amount, date, paid_by_user_id, split_type, notes, category_id, location_id, description, month) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [expense.amount, expense.date, expense.paid_by_user_id, expense.split_type || "50/50", expense.notes || null, expense.category_id, expense.location_id, expense.description, expense.month || null]
    );
    return this.getExpense(result.rows[0].id) as ExpenseWithDetails;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined> {
    const result = await pool.query(
      `UPDATE expenses SET amount = $1, date = $2, paid_by_user_id = $3, split_type = $4, notes = $5, category_id = $6, location_id = $7, description = $8, month = $9 WHERE id = $10 RETURNING *`,
      [expense.amount, expense.date, expense.paid_by_user_id, expense.split_type, expense.notes, expense.category_id, expense.location_id, expense.description, expense.month, id]
    );
    return this.getExpense(id);
  }


  async deleteExpense(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // Recurring Expense operations
  async getRecurringExpense(id: number): Promise<RecurringExpenseWithDetails | undefined> {
    const result = await pool.query(
      `SELECT 
        re.*, 
        c.*, 
        l.*, 
        u.* 
       FROM recurring_expenses re
       JOIN categories c ON re.category_id = c.id
       JOIN locations l ON re.location_id = l.id
       JOIN users u ON re.paid_by_user_id = u.id
       WHERE re.id = $1`,
      [id]
    );
    const row = result.rows[0];
    return row ? { ...row, category: {id: row.category_id, name: row.name, icon: row.icon, color: row.color}, location: {id: row.location_id, name: row.name}, paidByUser: {id: row.paid_by_user_id, username: row.username, email: row.email, password: row.password}} : undefined;
  }

  async getAllRecurringExpenses(): Promise<RecurringExpenseWithDetails[]> {
    const result = await pool.query(
      `SELECT 
        re.*, 
        c.*, 
        l.*, 
        u.* 
       FROM recurring_expenses re
       JOIN categories c ON re.category_id = c.id
       JOIN locations l ON re.location_id = l.id
       JOIN users u ON re.paid_by_user_id = u.id`
    );
    return result.rows.map(row => ({ ...row, category: {id: row.category_id, name: row.name, icon: row.icon, color: row.color}, location: {id: row.location_id, name: row.name}, paidByUser: {id: row.paid_by_user_id, username: row.username, email: row.email, password: row.password}}));
  }

  async getActiveRecurringExpenses(): Promise<RecurringExpenseWithDetails[]> {
    const result = await pool.query(
      `SELECT 
        re.*, 
        c.*, 
        l.*, 
        u.* 
       FROM recurring_expenses re
       JOIN categories c ON re.category_id = c.id
       JOIN locations l ON re.location_id = l.id
       JOIN users u ON re.paid_by_user_id = u.id
       WHERE re.is_active = true`
    );
    return result.rows.map(row => ({ ...row, category: {id: row.category_id, name: row.name, icon: row.icon, color: row.color}, location: {id: row.location_id, name: row.name}, paidByUser: {id: row.paid_by_user_id, username: row.username, email: row.email, password: row.password}}));
  }

  async createRecurringExpense(recurringExpense: InsertRecurringExpense): Promise<RecurringExpenseWithDetails> {
    const result = await pool.query(
      `INSERT INTO recurring_expenses (name, amount, next_date, paid_by_user_id, split_type, notes, frequency, is_active, category_id, location_id, description, end_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [recurringExpense.name, recurringExpense.amount, recurringExpense.next_date, recurringExpense.paid_by_user_id, recurringExpense.split_type || "50/50", recurringExpense.notes || null, recurringExpense.frequency, recurringExpense.is_active ?? true, recurringExpense.category_id, recurringExpense.location_id, recurringExpense.description, recurringExpense.end_date || null]
    );
    return this.getRecurringExpense(result.rows[0].id) as RecurringExpenseWithDetails;
  }

  async updateRecurringExpense(id: number, updatedRecurringExpense: Partial<InsertRecurringExpense>): Promise<RecurringExpenseWithDetails | undefined> {
    const result = await pool.query(
      `UPDATE recurring_expenses SET name = $1, amount = $2, next_date = $3, paid_by_user_id = $4, split_type = $5, notes = $6, frequency = $7, is_active = $8, category_id = $9, location_id = $10, description = $11, end_date = $12 WHERE id = $13 RETURNING *`,
      [updatedRecurringExpense.name, updatedRecurringExpense.amount, updatedRecurringExpense.next_date, updatedRecurringExpense.paid_by_user_id, updatedRecurringExpense.split_type, updatedRecurringExpense.notes, updatedRecurringExpense.frequency, updatedRecurringExpense.is_active, updatedRecurringExpense.category_id, updatedRecurringExpense.location_id, updatedRecurringExpense.description, updatedRecurringExpense.end_date, id]
    );
    return this.getRecurringExpense(id);
  }

  async deleteRecurringExpense(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM recurring_expenses WHERE id = $1', [id]);
    return result.rowCount > 0;
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
          await this.updateRecurringExpense(recurringExpense.id, { next_date: nextOccurrenceDate });
        }
      }
    }

    return createdExpenses;
  }

  private calculateNextOccurrence(currentDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "bi-weekly":
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "quarterly":
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case "yearly":
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
    const result = await pool.query(
      `SELECT 
        s.*, 
        fu.*, 
        tu.* 
       FROM settlements s
       JOIN users fu ON s.from_user_id = fu.id
       JOIN users tu ON s.to_user_id = tu.id
       WHERE s.id = $1`,
      [id]
    );
    const row = result.rows[0];
    return row ? { ...row, fromUser: {id: row.from_user_id, username: row.username, email: row.email, password: row.password}, toUser: {id: row.to_user_id, username: row.username, email: row.email, password: row.password}} : undefined;
  }

  async getAllSettlements(): Promise<SettlementWithUsers[]> {
    const result = await pool.query(
      `SELECT 
        s.*, 
        fu.*, 
        tu.* 
       FROM settlements s
       JOIN users fu ON s.from_user_id = fu.id
       JOIN users tu ON s.to_user_id = tu.id`
    );
    return result.rows.map(row => ({ ...row, fromUser: {id: row.from_user_id, username: row.username, email: row.email, password: row.password}, toUser: {id: row.to_user_id, username: row.username, email: row.email, password: row.password}}));
  }

  async getSettlementsByMonth(month: string): Promise<SettlementWithUsers[]> {
    const result = await pool.query(
      `SELECT 
        s.*, 
        fu.*, 
        tu.* 
       FROM settlements s
       JOIN users fu ON s.from_user_id = fu.id
       JOIN users tu ON s.to_user_id = tu.id
       WHERE DATE_TRUNC('month', s.date) = DATE_TRUNC('month', $1::date)`,
      [month]
    );
    return result.rows.map(row => ({ ...row, fromUser: {id: row.from_user_id, username: row.username, email: row.email, password: row.password}, toUser: {id: row.to_user_id, username: row.username, email: row.email, password: row.password}}));
  }

  async createSettlement(settlement: InsertSettlement): Promise<SettlementWithUsers> {
    const result = await pool.query(
      `INSERT INTO settlements (from_user_id, to_user_id, amount, date) VALUES ($1, $2, $3, $4) RETURNING *`,
      [settlement.from_user_id, settlement.to_user_id, settlement.amount, settlement.date]
    );
    return this.getSettlement(result.rows[0].id) as SettlementWithUsers;
  }

  // Summary operations
  async getMonthSummary(month: string): Promise<MonthSummary> {
    const expenses = await this.getExpensesByMonth(month);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Get user expenses and summarize by user
    const users = await this.getAllUsers();
    const userExpenses: Record<number, number> = {};

    // Initialize userExpenses with zeros
    users.forEach(user => {
      userExpenses[user.id] = 0;
    });

    // Sum expenses by who paid
    expenses.forEach(expense => {
      userExpenses[expense.paid_by_user_id] += expense.amount;
    });

    // Calculate category totals
    const categories = await this.getAllCategories();
    const categoryTotals: {category: Category, amount: number, percentage: number}[] = [];

    categories.forEach(category => {
      const categoryExpenses = expenses.filter(expense => expense.category_id === category.id);
      const amount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      if (amount > 0) {
        const percentage = this.calculatePercent(amount, totalExpenses);
        categoryTotals.push({ category, amount, percentage });
      }
    });

    // Sort categories by amount spent (descending)
    categoryTotals.sort((a, b) => b.amount - a.amount);

    // Calculate location totals
    const locations = await this.getAllLocations();
    const locationTotals: {location: Location, amount: number, percentage: number}[] = [];

    locations.forEach(location => {
      const locationExpenses = expenses.filter(expense => expense.location_id === location.id);
      const amount = locationExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      if (amount > 0) {
        const percentage = this.calculatePercent(amount, totalExpenses);
        locationTotals.push({ location, amount, percentage });
      }
    });

    // Sort locations by amount spent (descending)
    locationTotals.sort((a, b) => b.amount - a.amount);

    // Calculate split type totals
    const splitTypeTotals: Record<string, number> = {
      "50/50": 0,
      "100%": 0
    };

    expenses.forEach(expense => {
      const splitType = expense.split_type || "50/50";
      splitTypeTotals[splitType] = (splitTypeTotals[splitType] || 0) + expense.amount;
    });

    // Calculate date distribution (expenses per day)
    const dateDistribution: Record<string, number> = {};

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const day = date.getDate();
      const dateKey = String(day);
      dateDistribution[dateKey] = (dateDistribution[dateKey] || 0) + expense.amount;
    });

    // Calculate settlement amounts for the month
    let userIds = Object.keys(userExpenses).map(Number);
    let user1Id = userIds[0];
    let user2Id = userIds[1];

    // Calculate the amount paid by each user
    const user1Paid = userExpenses[user1Id] || 0;
    const user2Paid = userExpenses[user2Id] || 0;

    // Calculate what each user should have paid (50% of total)
    const eachShouldPay = totalExpenses / 2;

    // Calculate the difference
    let settlementAmount = 0;
    let settlementDirection = {
      fromUserId: 0,
      toUserId: 0
    };

    if (user1Paid > eachShouldPay) {
      // User 1 paid more
      settlementAmount = user1Paid - eachShouldPay;
      settlementDirection = {
        fromUserId: user2Id,
        toUserId: user1Id
      };
    } else if (user2Paid > eachShouldPay) {
      // User 2 paid more
      settlementAmount = user2Paid - eachShouldPay;
      settlementDirection = {
        fromUserId: user1Id,
        toUserId: user2Id
      };
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
      settlementDirection
    };
  }

  private calculatePercent(value: number, total: number): number {
    return Math.round((value / total) * 100);
  }
}

export interface IStorage extends Storage {}

// Create and export a singleton instance
export const storage = new Storage();