import { test, expect } from '@playwright/test';

test.describe('Expense Creation Flow', () => {
  // Navigate to expenses page before each test
  test.beforeEach(async ({ page }) => {
    // We can remove the login step as it's handled by auth.setup.ts
    // Go straight to expenses page
    await page.goto('/expenses');
  });

  test('should create a new expense', async ({ page }) => {
    // Click the create expense button
    await page.click('[data-testid="create-expense-button"]');
    
    // Fill out the expense form
    await page.fill('[data-testid="expense-title"]', 'Team Lunch');
    await page.fill('[data-testid="expense-amount"]', '120.50');
    await page.click('[data-testid="expense-date"]');
    await page.click('text=15'); // Select day 15 from calendar
    
    // Select a category
    await page.click('[data-testid="category-select"]');
    await page.click('text=Food & Dining');
    
    // Add expense participants
    await page.click('[data-testid="add-participant"]');
    await page.click('text=John Doe'); // Select a participant
    
    // Split expense equally
    await page.click('[data-testid="split-equally"]');
    
    // Submit the form
    await page.click('[data-testid="submit-expense"]');
    
    // Verify success message
    await expect(page.locator('text=Expense created successfully')).toBeVisible();
    
    // Verify expense appears in the list
    await expect(page.locator('text=Team Lunch')).toBeVisible();
    await expect(page.locator('text=£120.50')).toBeVisible(); // Note: Using GBP now (£)
  });

  test('should validate expense form inputs', async ({ page }) => {
    // Click the create expense button
    await page.click('[data-testid="create-expense-button"]');
    
    // Try to submit without filling required fields
    await page.click('[data-testid="submit-expense"]');
    
    // Verify validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Amount is required')).toBeVisible();
    await expect(page.locator('text=Date is required')).toBeVisible();
    
    // Fill in title only
    await page.fill('[data-testid="expense-title"]', 'Coffee');
    await page.click('[data-testid="submit-expense"]');
    
    // Verify remaining validation errors
    await expect(page.locator('text=Title is required')).not.toBeVisible();
    await expect(page.locator('text=Amount is required')).toBeVisible();
  });

  test('should allow uploading receipts for an expense', async ({ page }) => {
    // Click the create expense button
    await page.click('[data-testid="create-expense-button"]');
    
    // Fill necessary fields
    await page.fill('[data-testid="expense-title"]', 'Business Dinner');
    await page.fill('[data-testid="expense-amount"]', '89.99');
    await page.click('[data-testid="expense-date"]');
    await page.click('text=20'); // Select day 20
    
    // Upload receipt
    const fileInput = page.locator('[data-testid="receipt-upload"]');
    await fileInput.setInputFiles('./e2e/fixtures/receipt.jpg');
    
    // Verify upload success indicator
    await expect(page.locator('text=Receipt uploaded')).toBeVisible();
    
    // Submit the form
    await page.click('[data-testid="submit-expense"]');
    
    // Verify expense with receipt indicator
    await expect(page.locator('text=Business Dinner')).toBeVisible();
    await expect(page.locator('[data-testid="receipt-indicator"]')).toBeVisible();
  });

  test('should add expense to a settlement', async ({ page }) => {
    // Click the create expense button
    await page.click('[data-testid="create-expense-button"]');
    
    // Fill expense details
    await page.fill('[data-testid="expense-title"]', 'Group Activity');
    await page.fill('[data-testid="expense-amount"]', '75.00');
    await page.click('[data-testid="expense-date"]');
    await page.click('text=25'); // Select day 25
    
    // Select settlement
    await page.click('[data-testid="settlement-select"]');
    await page.click('text=Weekend Trip'); // Select an existing settlement
    
    // Submit the form
    await page.click('[data-testid="submit-expense"]');
    
    // Navigate to the settlement
    await page.goto('/settlements');
    await page.click('text=Weekend Trip');
    
    // Verify expense is in the settlement
    await expect(page.locator('text=Group Activity')).toBeVisible();
    await expect(page.locator('text=£75.00')).toBeVisible(); // Note: Using GBP now (£)
  });
}); 
