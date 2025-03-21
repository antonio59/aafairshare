import React from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Test Pages Index
 * 
 * This page serves as a central hub for all test pages used for visual regression testing
 * and compatibility verification with React 19 and Tailwind CSS 4.
 */
export default function TestPagesIndex() {
  const testPages = [
    {
      id: 'buttons',
      title: 'Buttons',
      description: 'Test all button variants, sizes, and states',
      path: '/test-pages/buttons',
    },
    {
      id: 'cards',
      title: 'Cards',
      description: 'Test card components with various layouts and content',
      path: '/test-pages/cards',
    },
    {
      id: 'dialogs',
      title: 'Dialogs',
      description: 'Test dialog components with different configurations',
      path: '/test-pages/dialogs',
    },
    {
      id: 'forms',
      title: 'Forms',
      description: 'Test form components with validation and various inputs',
      path: '/test-pages/forms',
    },
    {
      id: 'responsive',
      title: 'Responsive Layout',
      description: 'Test responsive layouts with Tailwind CSS 4 utilities',
      path: '/test-pages/responsive',
    },
    {
      id: 'theme',
      title: 'Theme System',
      description: 'Test theme switching between light and dark mode',
      path: '/test-pages/theme',
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Visual Regression Test Pages</h1>
        <p className="text-muted-foreground">
          These pages are used to verify component compatibility with React 19 and Tailwind CSS 4.
          Each page focuses on specific UI components and features to ensure proper styling and functionality.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testPages.map((page) => (
          <Card key={page.id} data-testid={`test-page-${page.id}`}>
            <CardHeader>
              <CardTitle>{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href={page.path} className="w-full">
                <Button className="w-full">View Test Page</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 p-6 border rounded-lg bg-muted/50">
        <h2 className="text-xl font-semibold mb-4">About These Test Pages</h2>
        <div className="space-y-4 text-sm">
          <p>
            These test pages are designed to help verify the compatibility of our UI components 
            with React 19 and Tailwind CSS 4. They serve as a visual reference for how components 
            should render and behave across different scenarios.
          </p>
          <p>
            Each test page focuses on specific components or features:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Buttons:</strong> Tests all button variants, sizes, and states</li>
            <li><strong>Cards:</strong> Tests card components with various layouts and content</li>
            <li><strong>Dialogs:</strong> Tests dialog components with different configurations</li>
            <li><strong>Forms:</strong> Tests form components with validation and various inputs</li>
            <li><strong>Responsive Layout:</strong> Tests responsive layouts with Tailwind CSS 4 utilities</li>
            <li><strong>Theme System:</strong> Tests theme switching between light and dark mode</li>
          </ul>
          <p>
            These pages can be used in conjunction with visual regression testing tools like Playwright
            to automatically detect any visual changes during future updates.
          </p>
        </div>
      </div>
    </div>
  );
}
