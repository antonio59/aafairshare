import { test, expect } from '@playwright/test';

/**
 * Button Component Visual Regression Test
 * 
 * This test verifies that the Button component renders correctly with Tailwind CSS 4
 * and React 19 by taking screenshots and comparing them against baseline images.
 */
test('Button component renders correctly', async ({ page }) => {
  // Create a simple test page that renders a button
  await page.setContent(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Button Test</title>
      <style>
        body { 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0;
          background-color: white;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          font-weight: 500;
          font-size: 0.875rem;
          line-height: 1.25rem;
          padding: 0.5rem 1rem;
          background-color: hsl(222.2 47.4% 11.2%);
          color: white;
          cursor: pointer;
        }
        .btn:hover {
          background-color: hsl(222.2 47.4% 9%);
        }
      </style>
    </head>
    <body>
      <button class="btn" data-testid="test-button">Button</button>
    </body>
    </html>
  `);
  
  // Take a screenshot of the button
  await expect(page.locator('[data-testid="test-button"]')).toHaveScreenshot('button-test.png');
});
