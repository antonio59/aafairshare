'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResponsiveTestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Responsive Layout Tests</h1>
      
      <div className="space-y-10">
        <Card>
          <CardHeader>
            <CardTitle>Responsive Grid Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="bg-muted p-4 rounded-md text-center"
                  data-testid={`grid-item-${item}`}
                >
                  Item {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Responsive Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="responsive-typography">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
                Responsive Heading
              </h1>
              <p className="text-sm sm:text-base md:text-lg mt-2">
                This paragraph adjusts its size based on the viewport width.
              </p>
              <p className="text-xs sm:text-sm md:text-base mt-2 text-muted-foreground">
                Smaller text also adjusts accordingly for better readability.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Responsive Spacing</CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="responsive-spacing" className="space-y-4 sm:space-y-6 md:space-y-8">
              <div className="p-4 sm:p-6 md:p-8 bg-muted rounded-md">
                This box has responsive padding that increases on larger screens.
              </div>
              <div className="p-4 sm:p-6 md:p-8 bg-muted rounded-md">
                The vertical spacing between these boxes also increases on larger screens.
              </div>
              <div className="p-4 sm:p-6 md:p-8 bg-muted rounded-md">
                Consistent spacing helps maintain visual hierarchy.
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Responsive Visibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="block sm:hidden" data-testid="visible-only-xs">
              <p className="p-4 bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 rounded-md">
                This content is only visible on mobile screens (xs).
              </p>
            </div>
            
            <div className="hidden sm:block" data-testid="visible-on-sm-and-up">
              <p className="p-4 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 rounded-md">
                This content is visible on sm screens and up (tablet and desktop).
              </p>
            </div>
            
            <div className="mt-4 hidden md:block">
              <p className="p-4 bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 rounded-md">
                This content is visible on md screens and up (desktop only).
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Responsive Flex Direction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="p-4 bg-muted rounded-md flex-1">
                <h3 className="font-medium">First Item</h3>
                <p>This container changes from vertical to horizontal layout.</p>
              </div>
              <div className="p-4 bg-muted rounded-md flex-1">
                <h3 className="font-medium">Second Item</h3>
                <p>Items stack vertically on mobile and side-by-side on larger screens.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Responsive Component Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="sm:flex sm:justify-between sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-semibold">Product Title</h3>
                <p className="text-muted-foreground">This is a product description</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="p-2 bg-muted rounded text-center sm:w-20">£99.99</div>
                <button className="bg-primary text-primary-foreground rounded p-2">Add to Cart</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
