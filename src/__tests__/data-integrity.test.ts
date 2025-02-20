import { fetchAllData } from '../store/supabaseOperations';
import { supabase } from '../supabase';
import type { Expense, Category, CategoryGroup, Tag, Budget, RecurringExpense, Settlement } from '../types';

describe('Data Integrity Tests', () => {
  beforeAll(async () => {
    // Set up test environment
    await supabase.auth.signOut();
  });

  describe('Category Integrity', () => {
    test('categories should maintain referential integrity', async () => {
      const data = await fetchAllData();
      
      // Verify each expense references a valid category
      data.expenses.forEach(expense => {
        const message = `Expense ${expense.id} references non-existent category ${expense.category}`;
        expect(data.categories.some(cat => cat.id === expense.category)).toBeTruthy();
      });

      // Verify each category belongs to a valid category group
      data.categories.forEach(category => {
        const message = `Category ${category.id} references non-existent group ${category.groupId}`;
        expect(data.categoryGroups.some(group => group.id === category.groupId)).toBeTruthy();
      });
    });

    test('no duplicate category names within same group', async () => {
      const data = await fetchAllData();
      const categoryNames = new Map<string, Set<string>>();

      data.categories.forEach(category => {
        if (!categoryNames.has(category.groupId)) {
          categoryNames.set(category.groupId, new Set());
        }
        const groupCategories = categoryNames.get(category.groupId)!;
        const message = `Duplicate category name "${category.name}" in group ${category.groupId}`;
        expect(groupCategories.has(category.name.toLowerCase())).toBeFalsy();
        groupCategories.add(category.name.toLowerCase());
      });
    });
  });

  describe('Tag Integrity', () => {
    test('no orphaned tags should exist', async () => {
      const data = await fetchAllData();
      
      // Verify each tag references a valid category
      data.tags.forEach(tag => {
        if (tag.categoryId) {  // Only check if categoryId exists
          const message = `Tag ${tag.id} references non-existent category ${tag.categoryId}`;
          expect(data.categories.some(cat => cat.id === tag.categoryId)).toBeTruthy();
        }
      });

      // Verify tags used in expenses exist
      data.expenses.forEach(expense => {
        if (expense.tags && expense.tags.length > 0) {  // Only check if tags exist
          expense.tags.forEach(tagId => {
            const message = `Expense ${expense.id} references non-existent tag ${tagId}`;
            expect(data.tags.some(tag => tag.id === tagId)).toBeTruthy();
          });
        }
      });
    });

    test('no duplicate tag names within same category', async () => {
      const data = await fetchAllData();
      const tagNames = new Map<string, Set<string>>();

      data.tags.forEach(tag => {
        if (tag.categoryId) {  // Only process tags with categoryId
          if (!tagNames.has(tag.categoryId)) {
            tagNames.set(tag.categoryId, new Set());
          }
          const categoryTags = tagNames.get(tag.categoryId)!;
          const message = `Duplicate tag name "${tag.name}" in category ${tag.categoryId}`;
          expect(categoryTags.has(tag.name.toLowerCase())).toBeFalsy();
          categoryTags.add(tag.name.toLowerCase());
        }
      });
    });
  });

  describe('Required Fields', () => {
    test('expenses should have all required fields', async () => {
      const data = await fetchAllData();
      
      data.expenses.forEach(expense => {
        expect(expense).toHaveProperty('id');
        expect(expense).toHaveProperty('amount');
        expect(typeof expense.amount).toBe('number');
        expect(expense).toHaveProperty('category');
        expect(expense).toHaveProperty('date');
        expect(expense).toHaveProperty('paidBy');
        expect(expense).toHaveProperty('split');
        expect(['Andres', 'Antonio']).toContain(expense.paidBy);
        expect(['equal', 'full']).toContain(expense.split);
      });
    });

    test('categories should have all required fields', async () => {
      const data = await fetchAllData();
      
      data.categories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('groupId');
        expect(category).toHaveProperty('color');
        expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    test('recurring expenses should have valid schedules', async () => {
      const data = await fetchAllData();
      
      data.recurringExpenses.forEach(recurring => {
        expect(recurring).toHaveProperty('id');
        expect(recurring).toHaveProperty('description');
        expect(recurring).toHaveProperty('amount');
        expect(typeof recurring.amount).toBe('number');
        expect(recurring).toHaveProperty('category');
        expect(recurring).toHaveProperty('paidBy');
        expect(recurring).toHaveProperty('split');
        if (recurring.lastProcessed) {
          expect(new Date(recurring.lastProcessed)).toBeInstanceOf(Date);
        }
      });
    });
  });

  describe('Budget Integrity', () => {
    test('budgets should reference valid categories', async () => {
      const data = await fetchAllData();
      
      data.budgets.forEach(budget => {
        const message = `Budget references non-existent category ${budget.category}`;
        expect(data.categories.some(cat => cat.id === budget.category)).toBeTruthy();
        expect(budget).toHaveProperty('amount');
        expect(typeof budget.amount).toBe('number');
        expect(budget.amount).toBeGreaterThan(0);
      });
    });
  });

  describe('Settlement Integrity', () => {
    test('settlements should have valid data', async () => {
      const data = await fetchAllData();
      
      data.settlements.forEach(settlement => {
        expect(settlement).toHaveProperty('month');
        expect(settlement).toHaveProperty('settledAt');
        expect(settlement).toHaveProperty('settledBy');
        expect(settlement).toHaveProperty('balance');
        expect(typeof settlement.balance).toBe('number');
        expect(new Date(settlement.settledAt)).toBeInstanceOf(Date);
        expect(['Andres', 'Antonio']).toContain(settlement.settledBy);
      });
    });
  });
});
