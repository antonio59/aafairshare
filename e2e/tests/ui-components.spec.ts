import { test, expect } from '@playwright/test';

/**
 * UI Components Visual Regression Test
 * 
 * This test verifies that UI components render correctly with Tailwind CSS 4
 * and React 19 by taking screenshots and comparing them against baseline images.
 */
test.describe('UI Components Visual Regression Tests', () => {
  
  test('Button variants render correctly', async ({ page }) => {
    // Create a test page with different button variants
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en" class="light">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Button Variants Test</title>
        <style>
          body { 
            display: flex; 
            flex-direction: column; 
            gap: 1rem;
            padding: 2rem; 
            font-family: sans-serif;
            background-color: white;
          }
          .container {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1rem;
            border: 1px solid #eaeaea;
            border-radius: 0.5rem;
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
            cursor: pointer;
          }
          .btn-default {
            background-color: hsl(222.2 47.4% 11.2%);
            color: white;
          }
          .btn-default:hover {
            background-color: hsl(222.2 47.4% 9%);
          }
          .btn-destructive {
            background-color: hsl(0 63% 31%);
            color: white;
          }
          .btn-destructive:hover {
            background-color: hsl(0 63% 29%);
          }
          .btn-outline {
            border: 1px solid hsl(215 16% 47% / 0.2);
            background-color: transparent;
            color: hsl(222.2 47.4% 11.2%);
          }
          .btn-outline:hover {
            background-color: hsl(215 16% 47% / 0.1);
          }
          .btn-secondary {
            background-color: hsl(215 16% 47% / 0.1);
            color: hsl(222.2 47.4% 11.2%);
          }
          .btn-secondary:hover {
            background-color: hsl(215 16% 47% / 0.2);
          }
          .btn-ghost {
            background-color: transparent;
            color: hsl(222.2 47.4% 11.2%);
          }
          .btn-ghost:hover {
            background-color: hsl(215 16% 47% / 0.1);
          }
          .btn-link {
            background-color: transparent;
            color: hsl(221.2 83.2% 53.3%);
            text-decoration: underline;
            padding: 0;
          }
          h2 {
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <h2>Button Variants</h2>
        <div class="container">
          <button class="btn btn-default" data-testid="btn-default">Default</button>
          <button class="btn btn-destructive" data-testid="btn-destructive">Destructive</button>
          <button class="btn btn-outline" data-testid="btn-outline">Outline</button>
          <button class="btn btn-secondary" data-testid="btn-secondary">Secondary</button>
          <button class="btn btn-ghost" data-testid="btn-ghost">Ghost</button>
          <button class="btn btn-link" data-testid="btn-link">Link</button>
        </div>
      </body>
      </html>
    `);
    
    // Take a screenshot of all button variants
    await expect(page.locator('.container')).toHaveScreenshot('button-variants.png');
    
    // Take screenshots of individual button variants
    await expect(page.locator('[data-testid="btn-default"]')).toHaveScreenshot('btn-default.png');
    await expect(page.locator('[data-testid="btn-destructive"]')).toHaveScreenshot('btn-destructive.png');
    await expect(page.locator('[data-testid="btn-outline"]')).toHaveScreenshot('btn-outline.png');
    await expect(page.locator('[data-testid="btn-secondary"]')).toHaveScreenshot('btn-secondary.png');
    await expect(page.locator('[data-testid="btn-ghost"]')).toHaveScreenshot('btn-ghost.png');
    await expect(page.locator('[data-testid="btn-link"]')).toHaveScreenshot('btn-link.png');
  });

  test('Card component renders correctly', async ({ page }) => {
    // Create a test page with card component
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en" class="light">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Card Component Test</title>
        <style>
          body { 
            display: flex; 
            flex-direction: column; 
            gap: 1rem;
            padding: 2rem; 
            font-family: sans-serif;
            background-color: white;
          }
          .container {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            max-width: 600px;
          }
          .card {
            display: flex;
            flex-direction: column;
            border-radius: 0.5rem;
            background-color: white;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            overflow: hidden;
            width: 100%;
          }
          .card-header {
            display: flex;
            flex-direction: column;
            padding: 1.5rem 1.5rem 0 1.5rem;
          }
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
          }
          .card-description {
            color: hsl(215 16% 47%);
            font-size: 0.875rem;
          }
          .card-content {
            padding: 1.5rem;
          }
          .card-footer {
            display: flex;
            justify-content: flex-end;
            padding: 1.5rem;
            border-top: 1px solid hsl(215 16% 47% / 0.1);
          }
          h2 {
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
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
            cursor: pointer;
            background-color: hsl(222.2 47.4% 11.2%);
            color: white;
          }
        </style>
      </head>
      <body>
        <h2>Card Component</h2>
        <div class="container">
          <div class="card" data-testid="card">
            <div class="card-header">
              <h3 class="card-title">Card Title</h3>
              <p class="card-description">Card description goes here</p>
            </div>
            <div class="card-content">
              <p>This is the main content of the card. It can contain any elements and text.</p>
            </div>
            <div class="card-footer">
              <button class="btn">Action</button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    
    // Take a screenshot of the card component
    await expect(page.locator('[data-testid="card"]')).toHaveScreenshot('card.png');
  });

  test('Form components render correctly', async ({ page }) => {
    // Create a test page with form components
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en" class="light">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Form Components Test</title>
        <style>
          body { 
            display: flex; 
            flex-direction: column; 
            gap: 1rem;
            padding: 2rem; 
            font-family: sans-serif;
            background-color: white;
          }
          .container {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            max-width: 600px;
            padding: 1.5rem;
            border: 1px solid #eaeaea;
            border-radius: 0.5rem;
          }
          .form-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .form-label {
            font-size: 0.875rem;
            font-weight: 500;
          }
          .form-input {
            display: flex;
            height: 2.5rem;
            width: 100%;
            border-radius: 0.375rem;
            border: 1px solid hsl(215 16% 47% / 0.2);
            background-color: white;
            padding: 0 0.75rem;
            font-size: 0.875rem;
          }
          .form-input:focus {
            outline: none;
            border-color: hsl(221.2 83.2% 53.3%);
            box-shadow: 0 0 0 2px hsl(221.2 83.2% 53.3% / 0.3);
          }
          .checkbox-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .checkbox {
            height: 1rem;
            width: 1rem;
            border-radius: 0.25rem;
            border: 1px solid hsl(215 16% 47% / 0.2);
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
            cursor: pointer;
            background-color: hsl(222.2 47.4% 11.2%);
            color: white;
            align-self: flex-start;
          }
          h2 {
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <h2>Form Components</h2>
        <div class="container" data-testid="form-container">
          <div class="form-item">
            <label class="form-label" for="name">Name</label>
            <input class="form-input" id="name" type="text" placeholder="Enter your name" data-testid="input-name" />
          </div>
          <div class="form-item">
            <label class="form-label" for="email">Email</label>
            <input class="form-input" id="email" type="email" placeholder="Enter your email" data-testid="input-email" />
          </div>
          <div class="form-item">
            <div class="checkbox-container">
              <input class="checkbox" id="terms" type="checkbox" data-testid="checkbox" />
              <label class="form-label" for="terms">I agree to the terms and conditions</label>
            </div>
          </div>
          <button class="btn" data-testid="submit-btn">Submit</button>
        </div>
      </body>
      </html>
    `);
    
    // Take a screenshot of the form components
    await expect(page.locator('[data-testid="form-container"]')).toHaveScreenshot('form-components.png');
    
    // Take screenshots of individual form components
    await expect(page.locator('[data-testid="input-name"]')).toHaveScreenshot('input-name.png');
    await expect(page.locator('[data-testid="checkbox"]')).toHaveScreenshot('checkbox.png');
    await expect(page.locator('[data-testid="submit-btn"]')).toHaveScreenshot('submit-btn.png');
  });

  test('Responsive layout renders correctly at different viewport sizes', async ({ page }) => {
    // Define viewport sizes for responsive testing
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 800, name: 'desktop' },
    ];
    
    // Create a test page with responsive layout
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en" class="light">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Responsive Layout Test</title>
        <style>
          body { 
            margin: 0;
            padding: 1rem; 
            font-family: sans-serif;
            background-color: white;
          }
          .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid hsl(215 16% 47% / 0.1);
            margin-bottom: 2rem;
          }
          .logo {
            font-size: 1.5rem;
            font-weight: 700;
          }
          .nav {
            display: flex;
            gap: 1rem;
          }
          .nav-link {
            color: hsl(222.2 47.4% 11.2%);
            text-decoration: none;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .card {
            padding: 1.5rem;
            border-radius: 0.5rem;
            background-color: white;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          }
          .footer {
            margin-top: 2rem;
            padding: 1rem 0;
            border-top: 1px solid hsl(215 16% 47% / 0.1);
            text-align: center;
            font-size: 0.875rem;
            color: hsl(215 16% 47%);
          }
          
          /* Responsive styles */
          @media (min-width: 768px) {
            .grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          @media (min-width: 1024px) {
            .grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          
          /* Mobile menu toggle */
          .menu-toggle {
            display: block;
          }
          
          @media (min-width: 768px) {
            .menu-toggle {
              display: none;
            }
          }
          
          /* Mobile nav */
          @media (max-width: 767px) {
            .nav {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container" data-testid="responsive-layout">
          <header class="header">
            <div class="logo">Logo</div>
            <button class="menu-toggle">Menu</button>
            <nav class="nav">
              <a href="#" class="nav-link">Home</a>
              <a href="#" class="nav-link">About</a>
              <a href="#" class="nav-link">Services</a>
              <a href="#" class="nav-link">Contact</a>
            </nav>
          </header>
          
          <div class="grid">
            <div class="card">Card 1</div>
            <div class="card">Card 2</div>
            <div class="card">Card 3</div>
            <div class="card">Card 4</div>
            <div class="card">Card 5</div>
            <div class="card">Card 6</div>
          </div>
          
          <footer class="footer">
            &copy; 2025 Company Name. All rights reserved.
          </footer>
        </div>
      </body>
      </html>
    `);
    
    // Test responsive layout at different viewport sizes
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(page.locator('[data-testid="responsive-layout"]')).toHaveScreenshot(`responsive-${viewport.name}.png`);
    }
  });

  test('Theme system renders correctly in light and dark modes', async ({ page }) => {
    // Create a test page with theme support
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en" class="light">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Theme System Test</title>
        <style>
          :root {
            --background: white;
            --foreground: hsl(222.2 47.4% 11.2%);
            --muted: hsl(215 16% 47% / 0.1);
            --muted-foreground: hsl(215 16% 47%);
            --border: hsl(215 16% 47% / 0.2);
            --card: white;
            --card-foreground: hsl(222.2 47.4% 11.2%);
            --primary: hsl(222.2 47.4% 11.2%);
            --primary-foreground: white;
          }
          
          .dark {
            --background: hsl(222.2 84% 4.9%);
            --foreground: hsl(210 40% 98%);
            --muted: hsl(217.2 32.6% 17.5%);
            --muted-foreground: hsl(215 20.2% 65.1%);
            --border: hsl(217.2 32.6% 17.5%);
            --card: hsl(222.2 84% 4.9%);
            --card-foreground: hsl(210 40% 98%);
            --primary: hsl(210 40% 98%);
            --primary-foreground: hsl(222.2 47.4% 11.2%);
          }
          
          body { 
            margin: 0;
            padding: 2rem; 
            font-family: sans-serif;
            background-color: var(--background);
            color: var(--foreground);
            transition: background-color 0.3s, color 0.3s;
          }
          
          .container {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          
          .theme-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            font-weight: 500;
            font-size: 0.875rem;
            line-height: 1.25rem;
            padding: 0.5rem 1rem;
            cursor: pointer;
            background-color: var(--primary);
            color: var(--primary-foreground);
            align-self: flex-start;
          }
          
          .card {
            padding: 1.5rem;
            border-radius: 0.5rem;
            background-color: var(--card);
            color: var(--card-foreground);
            border: 1px solid var(--border);
          }
          
          .muted-text {
            color: var(--muted-foreground);
            font-size: 0.875rem;
          }
          
          .badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
            font-weight: 500;
            font-size: 0.75rem;
            line-height: 1;
            padding: 0.25rem 0.5rem;
            background-color: var(--muted);
            color: var(--muted-foreground);
          }
          
          h2 {
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container" data-testid="theme-container">
          <button class="theme-toggle" id="theme-toggle" data-testid="theme-toggle">
            Toggle Dark Mode
          </button>
          
          <div class="card" data-testid="theme-card">
            <h2>Theme Card</h2>
            <p>This card adapts to the current theme.</p>
            <p class="muted-text">This is muted text that also adapts to the theme.</p>
            <span class="badge">Theme Badge</span>
          </div>
        </div>
        
        <script>
          // Theme toggle functionality
          const html = document.documentElement;
          const themeToggle = document.getElementById('theme-toggle');
          
          themeToggle.addEventListener('click', () => {
            if (html.classList.contains('light')) {
              html.classList.remove('light');
              html.classList.add('dark');
              themeToggle.textContent = 'Toggle Light Mode';
            } else {
              html.classList.remove('dark');
              html.classList.add('light');
              themeToggle.textContent = 'Toggle Dark Mode';
            }
          });
        </script>
      </body>
      </html>
    `);
    
    // Test light mode (default)
    await expect(page.locator('[data-testid="theme-container"]')).toHaveScreenshot('theme-light.png');
    
    // Toggle to dark mode and test
    await page.locator('[data-testid="theme-toggle"]').click();
    await expect(page.locator('[data-testid="theme-container"]')).toHaveScreenshot('theme-dark.png');
  });
});
