import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Cards Test Page
 * 
 * This page showcases card components with various layouts and content
 * to verify Tailwind CSS 4 styling and React 19 compatibility.
 */
export default function CardsTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Card Component Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Card */}
        <Card data-testid="basic-card">
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>This is a simple card with header, content, and footer</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card demonstrates the basic structure of a card component with Tailwind CSS 4 styling.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
        
        {/* Content-Only Card */}
        <Card data-testid="content-only-card">
          <CardContent className="pt-6">
            <p className="text-lg font-medium mb-2">Content-Only Card</p>
            <p className="text-sm text-muted-foreground">
              This card has only content without header or footer sections.
              It demonstrates the flexibility of the card component.
            </p>
          </CardContent>
        </Card>
        
        {/* Interactive Card */}
        <Card 
          data-testid="interactive-card"
          className="hover:shadow-lg transition-shadow duration-300"
        >
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>This card has hover effects</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hover over this card to see the shadow effect. This tests Tailwind CSS 4&apos;s transition utilities.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">View Details</Button>
          </CardFooter>
        </Card>
        
        {/* Card with Image */}
        <Card data-testid="image-card" className="overflow-hidden">
          <div className="h-48 bg-muted flex items-center justify-center">
            <svg 
              className="h-12 w-12 text-muted-foreground" 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <CardHeader>
            <CardTitle>Card with Image</CardTitle>
            <CardDescription>This card has an image placeholder</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Cards with images are commonly used for product displays, blog posts, and media galleries.</p>
          </CardContent>
        </Card>
        
        {/* Nested Cards */}
        <Card data-testid="nested-card" className="p-6">
          <CardTitle className="mb-4">Nested Cards</CardTitle>
          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="font-medium">Nested Card 1</p>
                <p className="text-sm">Testing nested card components</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <p className="font-medium">Nested Card 2</p>
                <p className="text-sm">Testing component composition</p>
              </CardContent>
            </Card>
          </div>
        </Card>
        
        {/* Custom Styled Card */}
        <Card 
          data-testid="custom-styled-card" 
          className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/20"
        >
          <CardHeader>
            <CardTitle className="text-primary">Custom Styled Card</CardTitle>
            <CardDescription>Testing Tailwind CSS 4 gradient utilities</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card uses custom styling with Tailwind CSS 4&apos;s gradient utilities and color opacity modifiers.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              Custom Button
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
