import pg from 'pg';
const { Pool } = pg;
import { 
  User, InsertUser, Category, InsertCategory, 
  Location, InsertLocation, Expense, InsertExpense,
  ExpenseWithDetails, Settlement, InsertSettlement,
  SettlementWithUsers, MonthSummary, TrendData
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
    const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await pool.query(
      'INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *',
      [category.name, category.color]
    );
    return result.rows[0];
  }

  async updateCategory(id: number, updatedCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const result = await pool.query(
      'UPDATE categories SET name = $1, color = $2 WHERE id = $3 RETURNING *',
      [updatedCategory.name, updatedCategory.color, id]
    );
    return result.rows[0];
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      // Start a transaction
      await pool.query('BEGIN');
      
      // Check if category exists
      const categoryCheck = await pool.query(
        'SELECT id FROM categories WHERE id = $1',
        [id]
      );
      
      if (categoryCheck.rows.length === 0) {
        await pool.query('ROLLBACK');
        return false;
      }

      // Check if category is in use
      const usageCheck = await pool.query(
        'SELECT COUNT(*) as count FROM expenses WHERE category_id = $1',
        [id]
      );

      if (parseInt(usageCheck.rows[0].count) > 0) {
        await pool.query('ROLLBACK');
        throw new Error('Cannot delete category that is in use by expenses');
      }

      // Delete the category
      const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
      await pool.query('COMMIT');
      
      return result.rowCount > 0;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
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
    const result = await pool.query('SELECT * FROM locations ORDER BY name ASC');
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
    try {
      // Start a transaction
      await pool.query('BEGIN');
      
      // Check if location exists
      const locationCheck = await pool.query(
        'SELECT id FROM locations WHERE id = $1',
        [id]
      );
      
      if (locationCheck.rows.length === 0) {
        await pool.query('ROLLBACK');
        return false;
      }

      // Check if location is in use
      const usageCheck = await pool.query(
        'SELECT COUNT(*) as count FROM expenses WHERE location_id = $1',
        [id]
      );

      if (parseInt(usageCheck.rows[0].count) > 0) {
        await pool.query('ROLLBACK');
        throw new Error('Cannot delete location that is in use by expenses');
      }

      // Delete the location
      const result = await pool.query('DELETE FROM locations WHERE id = $1', [id]);
      await pool.query('COMMIT');
      
      return result.rowCount > 0;
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }

  // Expense operations
  async getExpense(id: number): Promise<ExpenseWithDetails | undefined> {
    const result = await pool.query(
      `SELECT 
        e.*,
        c.id AS category_id,
        c.name AS category_name,
        c.color,
        l.id AS location_id,
        l.name AS location_name,
        u.id AS user_id,
        u.username,
        u.email,
        u.password
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       JOIN locations l ON e.location_id = l.id
       JOIN users u ON e.paid_by_user_id = u.id
       WHERE e.id = $1`,
      [id]
    );
    const row = result.rows[0];
    return row ? { 
      ...row, 
      category: {id: row.category_id, name: row.category_name, color: row.color}, 
      location: {id: row.location_id, name: row.location_name}, 
      paidByUser: {id: row.user_id, username: row.username, email: row.email, password: row.password}
    } : undefined;
  }

  async getAllExpenses(): Promise<ExpenseWithDetails[]> {
    const result = await pool.query(
      `SELECT 
        e.*,
        c.id AS category_id,
        c.name AS category_name,
        c.color,
        l.id AS location_id,
        l.name AS location_name,
        u.id AS user_id,
        u.username,
        u.email,
        u.password
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       JOIN locations l ON e.location_id = l.id
       JOIN users u ON e.paid_by_user_id = u.id`
    );
    return result.rows.map(row => ({ 
      ...row, 
      category: {id: row.category_id, name: row.category_name, color: row.color}, 
      location: {id: row.location_id, name: row.location_name}, 
      paidByUser: {id: row.user_id, username: row.username, email: row.email, password: row.password}
    }));
  }

  async getExpensesByMonth(month: string): Promise<ExpenseWithDetails[]> {
      const result = await pool.query(
        `SELECT 
          e.*,
          c.id AS category_id,
          c.name AS category_name,
          c.color,
          l.id AS location_id,
          l.name AS location_name,
          u.id AS user_id,
          u.username,
          u.email,
          u.password
         FROM expenses e
         JOIN categories c ON e.category_id = c.id
         JOIN locations l ON e.location_id = l.id
         JOIN users u ON e.paid_by_user_id = u.id
         WHERE DATE_TRUNC('month', e.date) = DATE_TRUNC('month', $1::timestamp)`,
        [`${month}-01`] // Add day to make it a valid date
      );
      return result.rows.map(row => ({ 
        ...row, 
        category: {id: row.category_id, name: row.category_name, color: row.color}, 
        location: {id: row.location_id, name: row.location_name}, 
        paidByUser: {id: row.user_id, username: row.username, email: row.email, password: row.password}
      }));
  }

  async createExpense(expense: InsertExpense): Promise<ExpenseWithDetails> {
    const result = await pool.query(
      `INSERT INTO expenses (amount, date, paid_by_user_id, split_type, category_id, location_id, description, month) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [expense.amount, expense.date, expense.paid_by_user_id, expense.split_type || "50/50", expense.category_id, expense.location_id, expense.description, expense.month || null]
    );
    const createdExpense = await this.getExpense(result.rows[0].id);
    if (!createdExpense) {
      throw new Error("Failed to retrieve created expense");
    }
    return createdExpense;
  }

  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithDetails | undefined> {
    const result = await pool.query(
      `UPDATE expenses SET amount = $1, date = $2, paid_by_user_id = $3, split_type = $4, category_id = $5, location_id = $6, description = $7, month = $8 WHERE id = $9 RETURNING *`,
      [expense.amount, expense.date, expense.paid_by_user_id, expense.split_type, expense.category_id, expense.location_id, expense.description, expense.month, id]
    );
    return this.getExpense(id);
  }


  async deleteExpense(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
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
        fu.id AS from_user_id,
        fu.username AS from_username,
        fu.email AS from_email,
        tu.id AS to_user_id,
        tu.username AS to_username,
        tu.email AS to_email
       FROM settlements s
       JOIN users fu ON s.from_user_id = fu.id
       JOIN users tu ON s.to_user_id = tu.id
       WHERE DATE_TRUNC('month', s.date) = DATE_TRUNC('month', $1::timestamp)`,
      [`${month}-01`] // Add day to make it a valid date
    );
    return result.rows.map(row => ({ 
      ...row, 
      fromUser: {
        id: row.from_user_id, 
        username: row.from_username, 
        email: row.from_email, 
        password: '' // We don't need to expose password
      }, 
      toUser: {
        id: row.to_user_id, 
        username: row.to_username, 
        email: row.to_email, 
        password: '' // We don't need to expose password
      }
    }));
  }

  async createSettlement(settlement: InsertSettlement): Promise<SettlementWithUsers> {
    const result = await pool.query(
      `INSERT INTO settlements (from_user_id, to_user_id, amount, date, month) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [settlement.from_user_id, settlement.to_user_id, settlement.amount, settlement.date, settlement.month]
    );
    const createdSettlement = await this.getSettlement(result.rows[0].id);
    if (!createdSettlement) {
      throw new Error("Failed to retrieve created settlement");
    }
    return createdSettlement;
  }

  async deleteSettlement(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM settlements WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Summary operations
  async getMonthSummary(month: string): Promise<MonthSummary> {
    const expenses = await this.getExpensesByMonth(month);

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    // Get user expenses and summarize by user
    const users = await this.getAllUsers();
    const userExpenses: Record<number, number> = {};

    // Initialize userExpenses with zeros
    users.forEach(user => {
      userExpenses[user.id] = 0;
    });

    // Sum expenses accounting for split types
    expenses.forEach(expense => {
      if (expense.split_type === "50/50") {
        // For 50/50 splits, add the full amount to the paying user's expenses
        userExpenses[expense.paid_by_user_id] += Number(expense.amount);
      } else if (expense.split_type === "100%") {
        // For 100% splits, the other user owes the full amount
        // This means the paying user's contribution should count toward the total,
        // but the other user is responsible for the entire expense amount
        
        // First, get the other user's ID
        const otherUserId = Object.keys(userExpenses)
          .map(Number)
          .find(id => id !== expense.paid_by_user_id);
          
        if (otherUserId) {
          // The paying user paid, but the other user owes 100%
          // So we credit the paying user's expenses (they paid but don't owe)
          userExpenses[expense.paid_by_user_id] += Number(expense.amount);
          
          // We don't need to add anything to the other user's expenses,
          // as the settlement calculation will reflect that they owe the full amount
        }
      }
    });

    // Calculate category totals
    const categories = await this.getAllCategories();
    const categoryTotals: {category: Category, amount: number, percentage: number}[] = [];

    categories.forEach(category => {
      const categoryExpenses = expenses.filter(expense => expense.category_id === category.id);
      const amount = categoryExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
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
      const amount = locationExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
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
      splitTypeTotals[splitType] = (splitTypeTotals[splitType] || 0) + Number(expense.amount);
    });

    // Calculate date distribution (expenses per day)
    const dateDistribution: Record<string, number> = {};

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const day = date.getDate();
      const dateKey = String(day);
      dateDistribution[dateKey] = (dateDistribution[dateKey] || 0) + Number(expense.amount);
    });

    // Calculate settlement amounts for the month
    let userIds = Object.keys(userExpenses).map(Number).filter(id => userExpenses[id] !== undefined);

    if (userIds.length !== 2) {
      return {
        month,
        totalExpenses,
        userExpenses,
        categoryTotals,
        locationTotals,
        splitTypeTotals,
        dateDistribution,
        settlementAmount: 0,
        settlementDirection: { fromUserId: 0, toUserId: 0 }
      };
    }

    let [user1Id, user2Id] = userIds;
    const user1Paid = userExpenses[user1Id];
    const user2Paid = userExpenses[user2Id];

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

  // Trend Analysis - Get data for multiple months to display trends
  async getTrendData(monthsCount: number = 6): Promise<TrendData> {
    const today = new Date();
    const months: string[] = [];
    const totalsByMonth: number[] = [];
    const categoriesData: Record<string, number[]> = {};
    const locationsData: Record<string, number[]> = {};
    
    // Generate the last N months (including current)
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.unshift(monthStr); // Add to beginning to keep chronological order
    }
    
    // Get all categories and locations
    const allCategories = await this.getAllCategories();
    const allLocations = await this.getAllLocations();
    
    // Initialize data structures
    allCategories.forEach(category => {
      categoriesData[category.name] = Array(months.length).fill(0);
    });
    
    allLocations.forEach(location => {
      locationsData[location.name] = Array(months.length).fill(0);
    });
    
    // Fetch data for each month
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const expenses = await this.getExpensesByMonth(month);
      
      // Calculate total for month
      const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      totalsByMonth[i] = total;
      
      // Calculate totals by category
      expenses.forEach(expense => {
        const categoryName = expense.category.name;
        if (categoriesData[categoryName]) {
          categoriesData[categoryName][i] += Number(expense.amount);
        }
      });
      
      // Calculate totals by location
      expenses.forEach(expense => {
        const locationName = expense.location.name;
        if (locationsData[locationName]) {
          locationsData[locationName][i] += Number(expense.amount);
        }
      });
    }
    
    return {
      months,
      totalsByMonth,
      categoriesData,
      locationsData
    };
  }

  private calculatePercent(value: number, total: number): number {
    return Math.round((value / total) * 100);
  }
}

export interface IStorage extends Storage {}

// Create and export a singleton instance
export const storage = new Storage();