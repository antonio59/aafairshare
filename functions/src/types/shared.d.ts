// Type declarations for shared modules

declare module 'shared/schema' {
  // Re-export from app/shared/schema.ts
  export type User = {
    id: string;
    username: string;
    email: string | null;
    photoURL?: string;
    createdAt?: Date;
  };

  export type Category = {
    id: string;
    name: string;
    icon?: string;
  };

  export type Location = {
    id: string;
    name: string;
    color?: string;
  };

  export type Expense = {
    id: string;
    description?: string;
    amount: number;
    date: Date;
    paidByUserId: string;
    splitType: string;
    categoryId: string;
    locationId: string;
    month: string;
    recurringExpenseId?: string;
  };

  export type Settlement = {
    id: string;
    month: string;
    amount: number;
    fromUserId: string;
    toUserId: string;
    date: Date;
  };

  export enum RecurringFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    BIWEEKLY = 'biweekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly',
    YEARLY = 'yearly'
  }

  export type RecurringExpense = {
    id: string;
    title: string;
    description?: string;
    amount: number;
    categoryId: string;
    locationId: string;
    paidByUserId: string;
    splitType: string;
    frequency: RecurringFrequency;
    startDate: Date;
    endDate?: Date;
    lastGeneratedDate?: Date;
    isActive: boolean;
  };
}

declare module 'shared/formatting' {
  export function formatCurrency(amount: number | undefined | null): string;
  export function formatDate(date: Date | string | any): string;
}