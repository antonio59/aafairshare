export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RecurringExpense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
  paidByUserId: string;
  splitType: string;
  categoryId: string;
  locationId: string;
  lastGeneratedDate?: Date;
  isActive: boolean;
}