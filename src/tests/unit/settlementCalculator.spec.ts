import { test, expect } from '@playwright/test';
import { calculateSettlement, calculateMonthlySettlements } from '@/utils/settlementCalculator';
import type { Expense, Settlement } from '@/types/expenses';
import type { User } from '@/utils/settlementCalculator';

test.describe('Settlement Calculator', () => {
  const testUsers: User[] = [
    {
      id: 'user1',
      email: 'user1@example.com',
      name: 'User 1'
    },
    {
      id: 'user2',
      email: 'user2@example.com',
      name: 'User 2'
    }
  ];

  test('should calculate correct settlements for simple expenses', async ({ page }) => {
    const expenses: Partial<Expense>[] = [
      {
        id: '1',
        amount: 100,
        paid_by: 'user1',
        category_id: 'food',
        location_id: 'restaurant',
        notes: 'Dinner',
        date: new Date('2023-01-01').toISOString(),
        split_type: 'Equal',
        users: { name: 'User 1' },
        created_at: new Date('2023-01-01').toISOString()
      }
    ];

    const result = calculateSettlement(expenses as Expense[], testUsers);
    expect(result).toHaveLength(1);
    const settlement = result[0];
    expect(settlement).toBeDefined();
    if (settlement) {
      expect(settlement.from).toBe('User 2');
      expect(settlement.to).toBe('User 1');
      expect(settlement.amount).toBe(50);
    }
  });

  test('should handle multiple expenses with different payers', async ({ page }) => {
    const expenses: Partial<Expense>[] = [
      {
        id: '1',
        amount: 100,
        paid_by: 'user1',
        category_id: 'food',
        location_id: 'restaurant',
        notes: 'Dinner',
        date: new Date('2023-01-01').toISOString(),
        split_type: 'Equal',
        users: { name: 'User 1' },
        created_at: new Date('2023-01-01').toISOString()
      },
      {
        id: '2',
        amount: 60,
        paid_by: 'user2',
        category_id: 'transport',
        location_id: 'taxi',
        notes: 'Taxi',
        date: new Date('2023-01-01').toISOString(),
        split_type: 'Equal',
        users: { name: 'User 2' },
        created_at: new Date('2023-01-01').toISOString()
      }
    ];

    const result = calculateSettlement(expenses as Expense[], testUsers);
    expect(result).toHaveLength(1);
    const settlement = result[0];
    expect(settlement).toBeDefined();
    if (settlement) {
      expect(settlement.from).toBe('User 2');
      expect(settlement.to).toBe('User 1');
      expect(settlement.amount).toBe(20); // (100 - 60) / 2
    }
  });

  test('should calculate monthly settlements correctly', async ({ page }) => {
    const expenses: Partial<Expense>[] = [
      {
        id: '1',
        amount: 100,
        paid_by: 'user1',
        category_id: 'food',
        location_id: 'restaurant',
        notes: 'January Dinner',
        date: new Date('2023-01-01').toISOString(),
        split_type: 'Equal',
        users: { name: 'User 1' },
        created_at: new Date('2023-01-01').toISOString()
      },
      {
        id: '2',
        amount: 200,
        paid_by: 'user1',
        category_id: 'rent',
        location_id: 'home',
        notes: 'February Rent',
        date: new Date('2023-02-01').toISOString(),
        split_type: 'Equal',
        users: { name: 'User 1' },
        created_at: new Date('2023-02-01').toISOString()
      }
    ];

    const result = calculateMonthlySettlements(expenses as Expense[], testUsers);
    expect(Object.keys(result)).toHaveLength(2);
    
    const januarySettlement = result['2023-01'];
    const februarySettlement = result['2023-02'];
    
    expect(januarySettlement).toBeDefined();
    expect(februarySettlement).toBeDefined();
    
    if (januarySettlement) {
      expect(januarySettlement.amount).toBe(50);
      expect(januarySettlement.from).toBe('User 2');
      expect(januarySettlement.to).toBe('User 1');
    }
    
    if (februarySettlement) {
      expect(februarySettlement.amount).toBe(100);
      expect(februarySettlement.from).toBe('User 2');
      expect(februarySettlement.to).toBe('User 1');
    }
  });
}); 