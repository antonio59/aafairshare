import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
  color: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Locations table
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  name: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Expenses table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  paid_by_user_id: integer("paid_by_user_id").notNull(), // reference to user ID
  split_type: text("split_type").notNull().default("50/50"),
  category_id: integer("category_id").notNull(), // reference to category ID
  location_id: integer("location_id").notNull(), // reference to location ID
  month: text("month"), // YYYY-MM format, auto-populated by trigger
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  date: true,
  paid_by_user_id: true,
  split_type: true,
  category_id: true,
  location_id: true,
  month: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Extended Expense type with related data
export type ExpenseWithDetails = Expense & {
  category: Category;
  location: Location;
  paidByUser: User;
};

// Settlements table
export const settlements = pgTable("settlements", {
  id: serial("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  month: text("month").notNull(), // Format: YYYY-MM
  from_user_id: integer("from_user_id").notNull(),
  to_user_id: integer("to_user_id").notNull(),
  notes: text("notes"),
});

export const insertSettlementSchema = createInsertSchema(settlements).pick({
  amount: true,
  date: true,
  month: true,
  from_user_id: true,
  to_user_id: true,
  notes: true,
});

export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type Settlement = typeof settlements.$inferSelect;

// Extended Settlement type with related data
export type SettlementWithUsers = Settlement & {
  fromUser: User;
  toUser: User;
};

// Recurring Expenses table
export const recurringExpenses = pgTable("recurring_expenses", {
  id: serial("id").primaryKey(),
  // Keep name as not null for now, but we'll populate it automatically in the code
  name: text("name").notNull().default(""),
  description: text("description").default(""),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // 'monthly', 'weekly', etc
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"), // Column now exists in the database
  next_date: timestamp("next_date").notNull(),
  paid_by_user_id: integer("paid_by_user_id").notNull(), // reference to user ID
  split_type: text("split_type").notNull().default("50/50"),
  // Keep notes field but it should be optional
  notes: text("notes").default(""),
  category_id: integer("category_id").notNull(), // reference to category ID
  location_id: integer("location_id").notNull(), // reference to location ID
  is_active: boolean("is_active").notNull().default(true),
});

export const insertRecurringExpenseSchema = createInsertSchema(recurringExpenses).pick({
  name: true,
  description: true,
  amount: true,
  frequency: true,
  start_date: true,
  end_date: true, // Re-added as the column now exists in the database
  next_date: true,
  paid_by_user_id: true,
  split_type: true,
  notes: true,
  category_id: true,
  location_id: true,
  is_active: true,
});

export type InsertRecurringExpense = z.infer<typeof insertRecurringExpenseSchema>;
export type RecurringExpense = typeof recurringExpenses.$inferSelect;

// Extended RecurringExpense type with related data
export type RecurringExpenseWithDetails = RecurringExpense & {
  category: Category;
  location: Location;
  paidByUser: User;
};

// Custom types for API responses
export type MonthSummary = {
  month: string;
  totalExpenses: number;
  userExpenses: Record<number, number>;
  categoryTotals: Array<{
    category: Category;
    amount: number;
    percentage: number;
  }>;
  locationTotals: Array<{
    location: Location;
    amount: number;
    percentage: number;
  }>;
  splitTypeTotals: Record<string, number>;
  dateDistribution: Record<string, number>;
  settlementAmount: number;
  settlementDirection: {
    fromUserId: number;
    toUserId: number;
  };
};
