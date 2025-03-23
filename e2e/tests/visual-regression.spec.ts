import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Tailwind CSS 4 Compatibility
 * 
 * These tests verify that UI components render correctly with Tailwind CSS 4
 * and React 19 by taking screenshots and comparing them against baseline images.
 */
test.describe('Visual Regression Tests', () => {
  // Define viewport sizes for responsive testing
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 800, name: 'desktop' },
  ];

  // Test index page
  test('Test pages index renders correctly', async ({ page }) => {
    await page.goto('/test-pages');
    await expect(page).toHaveScreenshot('test-pages-index.png');
    
    // Test individual test page cards
    for (const testPage of ['buttons', 'cards', 'dialogs', 'forms', 'responsive', 'theme']) {
      await expect(page.locator(`[data-testid="test-page-${testPage}"]`))
        .toHaveScreenshot(`test-page-card-${testPage}.png`);
    }
  });

  // Button Component Tests
  test('Button components render correctly', async ({ page }) => {
    await page.goto('/test-pages/buttons');
    
    // Take screenshot of the entire buttons test page
    await expect(page).toHaveScreenshot('buttons-page.png');
    
    // Test individual button variants
    await expect(page.locator('[data-testid="button-default"]')).toHaveScreenshot('button-default.png');
    await expect(page.locator('[data-testid="button-destructive"]')).toHaveScreenshot('button-destructive.png');
    await expect(page.locator('[data-testid="button-outline"]')).toHaveScreenshot('button-outline.png');
    await expect(page.locator('[data-testid="button-secondary"]')).toHaveScreenshot('button-secondary.png');
    await expect(page.locator('[data-testid="button-ghost"]')).toHaveScreenshot('button-ghost.png');
    await expect(page.locator('[data-testid="button-link"]')).toHaveScreenshot('button-link.png');
    
    // Test button sizes
    await expect(page.locator('[data-testid="button-size-default"]')).toHaveScreenshot('button-size-default.png');
    await expect(page.locator('[data-testid="button-size-sm"]')).toHaveScreenshot('button-size-sm.png');
    await expect(page.locator('[data-testid="button-size-lg"]')).toHaveScreenshot('button-size-lg.png');
    await expect(page.locator('[data-testid="button-size-icon"]')).toHaveScreenshot('button-size-icon.png');
    
    // Test button states
    await expect(page.locator('[data-testid="button-normal"]')).toHaveScreenshot('button-normal.png');
    await expect(page.locator('[data-testid="button-disabled"]')).toHaveScreenshot('button-disabled.png');
    await expect(page.locator('[data-testid="button-loading"]')).toHaveScreenshot('button-loading.png');
    
    // Test buttons with icons
    await expect(page.locator('[data-testid="button-with-left-icon"]')).toHaveScreenshot('button-with-left-icon.png');
    await expect(page.locator('[data-testid="button-with-right-icon"]')).toHaveScreenshot('button-with-right-icon.png');
    
    // Test hover states
    await page.locator('[data-testid="button-default"]').hover();
    await expect(page.locator('[data-testid="button-default"]')).toHaveScreenshot('button-default-hover.png');
    
    await page.locator('[data-testid="button-ghost"]').hover();
    await expect(page.locator('[data-testid="button-ghost"]')).toHaveScreenshot('button-ghost-hover.png');
  });
  
  // Card Component Tests
  test('Card components render correctly', async ({ page }) => {
    await page.goto('/test-pages/cards');
    
    // Take screenshot of the entire cards test page
    await expect(page).toHaveScreenshot('cards-page.png');
    
    // Test individual card variants
    await expect(page.locator('[data-testid="basic-card"]')).toHaveScreenshot('card-basic.png');
    await expect(page.locator('[data-testid="content-only-card"]')).toHaveScreenshot('card-content-only.png');
    await expect(page.locator('[data-testid="interactive-card"]')).toHaveScreenshot('card-interactive.png');
    await expect(page.locator('[data-testid="image-card"]')).toHaveScreenshot('card-with-image.png');
    await expect(page.locator('[data-testid="nested-card"]')).toHaveScreenshot('card-nested.png');
    await expect(page.locator('[data-testid="custom-styled-card"]')).toHaveScreenshot('card-custom-styled.png');
    
    // Test hover effects
    await page.locator('[data-testid="interactive-card"]').hover();
    await expect(page.locator('[data-testid="interactive-card"]')).toHaveScreenshot('card-interactive-hover.png');
  });
  
  // Form Component Tests
  test('Form components render correctly', async ({ page }) => {
    await page.goto('/test-pages/forms');
    
    // Take screenshot of the entire forms test page
    await expect(page).toHaveScreenshot('forms-page.png');
    
    // Test validated form
    await expect(page.locator('[data-testid="validated-form"]')).toHaveScreenshot('form-validated.png');
    
    // Test input variants
    await expect(page.locator('[data-testid="input-variants"]')).toHaveScreenshot('form-input-variants.png');
    
    // Test select and checkbox components
    await expect(page.locator('[data-testid="select-checkbox"]')).toHaveScreenshot('form-select-checkbox.png');
    
    // Test form interactions
    // Fill in a field and test validation
    await page.locator('#username').fill('a'); // Too short to pass validation
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[data-testid="validated-form"]')).toHaveScreenshot('form-validation-error.png');
    
    // Test select dropdown
    await page.locator('#theme').click();
    await expect(page).toHaveScreenshot('form-select-dropdown-open.png');
  });
  
  // Dialog Component Tests
  test('Dialog components render correctly', async ({ page }) => {
    await page.goto('/test-pages/dialogs');
    
    // Test basic dialog
    await page.locator('[data-testid="open-dialog-button"]').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('dialog-basic.png');
    await page.keyboard.press('Escape');
    
    // Test controlled dialog
    await page.locator('[data-testid="open-controlled-dialog-button"]').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('dialog-controlled.png');
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Test alert dialog
    await page.locator('[data-testid="open-alert-dialog-button"]').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('dialog-alert.png');
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Test form dialog
    await page.locator('[data-testid="open-form-dialog-button"]').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('dialog-form.png');
    await page.getByRole('button', { name: 'Save changes' }).click();
    
    // Test custom styled dialog
    await page.locator('[data-testid="open-custom-dialog-button"]').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('dialog-custom-styled.png');
    await page.keyboard.press('Escape');
  });
  
  // Responsive Layout Tests
  test('Responsive layouts render correctly at different viewport sizes', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/test-pages/responsive');
      await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`);
      
      // Test specific responsive components
      await expect(page.locator('[data-testid="grid-item-1"]')).toHaveScreenshot(`responsive-grid-item-${viewport.name}.png`);
      await expect(page.locator('[data-testid="responsive-typography"]')).toHaveScreenshot(`responsive-typography-${viewport.name}.png`);
      await expect(page.locator('[data-testid="responsive-spacing"]')).toHaveScreenshot(`responsive-spacing-${viewport.name}.png`);
    }
    
    // Test visibility classes
    await page.setViewportSize({ width: 375, height: 667 }); // mobile
    await expect(page.locator('[data-testid="visible-only-xs"]')).toBeVisible();
    await expect(page.locator('[data-testid="visible-on-sm-and-up"]')).not.toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 }); // tablet
    await expect(page.locator('[data-testid="visible-only-xs"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="visible-on-sm-and-up"]')).toBeVisible();
  });
  
  // Theme System Tests
  test('Theme system renders correctly in light and dark modes', async ({ page }) => {
    await page.goto('/test-pages/theme');
    
    // Test light mode (default)
    await expect(page).toHaveScreenshot('theme-light.png');
    
    // Test theme color swatches in light mode
    await expect(page.locator('.bg-background')).toHaveScreenshot('theme-light-background.png');
    await expect(page.locator('.bg-primary')).toHaveScreenshot('theme-light-primary.png');
    await expect(page.locator('.bg-secondary')).toHaveScreenshot('theme-light-secondary.png');
    
    // Switch to dark mode
    await page.locator('[data-testid="theme-toggle"]').click();
    await page.waitForTimeout(500); // Wait for theme transition
    
    // Test dark mode
    await expect(page).toHaveScreenshot('theme-dark.png');
    
    // Test theme color swatches in dark mode
    await expect(page.locator('.bg-background')).toHaveScreenshot('theme-dark-background.png');
    await expect(page.locator('.bg-primary')).toHaveScreenshot('theme-dark-primary.png');
    await expect(page.locator('.bg-secondary')).toHaveScreenshot('theme-dark-secondary.png');
  });
  
  // Cross-page tests for consistent styling
  test('Component styling is consistent across pages', async ({ page }) => {
    // Test buttons on different pages
    await page.goto('/test-pages/buttons');
    await expect(page.locator('[data-testid="button-default"]')).toHaveScreenshot('cross-page-button-default.png');
    
    await page.goto('/test-pages/cards');
    await expect(page.locator('button:has-text("Save")')).toHaveScreenshot('cross-page-button-card-footer.png');
    
    await page.goto('/test-pages/forms');
    await expect(page.locator('button[type="submit"]')).toHaveScreenshot('cross-page-button-form-submit.png');
    
    // Test cards on different pages
    await page.goto('/test-pages/cards');
    await expect(page.locator('[data-testid="basic-card"]')).toHaveScreenshot('cross-page-card-cards.png');
    
    await page.goto('/test-pages/');
    await expect(page.locator('[data-testid="test-page-buttons"]')).toHaveScreenshot('cross-page-card-index.png');
  });
});
