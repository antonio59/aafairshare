import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Responsive Layout Test Page
 * 
 * This page tests responsive layouts with Tailwind CSS 4 to ensure
 * components adapt correctly to different viewport sizes.
 */
export default function ResponsiveTestPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">Responsive Layout Test</h1>
      
      {/* Responsive Grid Layout */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Responsive Grid</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} data-testid={`grid-item-${item}`}>
              <CardContent className="p-4">
                <p className="font-medium">Grid Item {item}</p>
                <p className="text-sm text-muted-foreground">
                  This grid adapts to different screen sizes
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Responsive Flex Layout */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Responsive Flex</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1" data-testid="flex-item-1">
            <CardHeader>
              <CardTitle>Flex Item 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This layout switches between column and row based on viewport width</p>
            </CardContent>
          </Card>
          <Card className="flex-1" data-testid="flex-item-2">
            <CardHeader>
              <CardTitle>Flex Item 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Testing Tailwind CSS 4 flex utilities with responsive modifiers</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Responsive Typography */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Responsive Typography</h2>
        <Card data-testid="responsive-typography">
          <CardContent className="p-6">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2">
              This heading changes size
            </h3>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg">
              This paragraph text also adapts to different viewport sizes using Tailwind&apos;s responsive modifiers.
            </p>
          </CardContent>
        </Card>
      </section>
      
      {/* Responsive Spacing */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Responsive Spacing</h2>
        <div className="p-2 sm:p-4 md:p-6 lg:p-8 bg-muted rounded-lg" data-testid="responsive-spacing">
          <div className="mb-2 sm:mb-4 md:mb-6 lg:mb-8">
            <p className="font-medium">Responsive Padding and Margin</p>
            <p className="text-sm text-muted-foreground">
              This container has different padding and margin based on screen size
            </p>
          </div>
          <Button className="w-full sm:w-auto">Responsive Button</Button>
        </div>
      </section>
      
      {/* Responsive Visibility */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Responsive Visibility</h2>
        <div className="border rounded-lg p-4">
          <p className="hidden sm:block" data-testid="visible-on-sm-and-up">
            This text is hidden on mobile but visible on sm screens and up
          </p>
          <p className="block md:hidden" data-testid="visible-until-md">
            This text is visible on mobile and sm screens but hidden on md screens and up
          </p>
          <p className="hidden lg:block" data-testid="visible-on-lg-and-up">
            This text is only visible on lg screens and up
          </p>
          <p className="block sm:hidden" data-testid="visible-only-xs">
            This text is only visible on mobile (xs)
          </p>
        </div>
      </section>
    </div>
  );
}
