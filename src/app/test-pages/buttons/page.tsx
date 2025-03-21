import React from 'react';
import { Button } from '@/components/ui/button';

/**
 * Button Test Page
 * 
 * This page showcases all button variants to verify Tailwind CSS 4 styling
 * and React 19 compatibility.
 */
export default function ButtonsTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Button Component Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
          
          <div className="flex flex-col gap-4">
            <Button 
              data-testid="button-default"
              variant="default"
            >
              Default Button
            </Button>
            
            <Button 
              data-testid="button-destructive"
              variant="destructive"
            >
              Destructive Button
            </Button>
            
            <Button 
              data-testid="button-outline"
              variant="outline"
            >
              Outline Button
            </Button>
            
            <Button 
              data-testid="button-secondary"
              variant="secondary"
            >
              Secondary Button
            </Button>
            
            <Button 
              data-testid="button-ghost"
              variant="ghost"
            >
              Ghost Button
            </Button>
            
            <Button 
              data-testid="button-link"
              variant="link"
            >
              Link Button
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
          
          <div className="flex flex-col gap-4">
            <Button 
              data-testid="button-size-default"
              size="default"
            >
              Default Size
            </Button>
            
            <Button 
              data-testid="button-size-sm"
              size="sm"
            >
              Small Size
            </Button>
            
            <Button 
              data-testid="button-size-lg"
              size="lg"
            >
              Large Size
            </Button>
            
            <Button 
              data-testid="button-size-icon"
              size="icon"
            >
              <svg 
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
                <path d="M12 5v14M5 12h14" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Button States</h2>
          
          <div className="flex flex-col gap-4">
            <Button data-testid="button-normal">
              Normal Button
            </Button>
            
            <Button data-testid="button-disabled" disabled>
              Disabled Button
            </Button>
            
            <div className="flex items-center gap-2">
              <Button data-testid="button-loading" disabled>
                <svg 
                  className="mr-2 h-4 w-4 animate-spin" 
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
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Loading
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Button with Icons</h2>
          
          <div className="flex flex-col gap-4">
            <Button data-testid="button-with-left-icon">
              <svg 
                className="mr-2 h-4 w-4" 
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Left Icon
            </Button>
            
            <Button data-testid="button-with-right-icon">
              Right Icon
              <svg 
                className="ml-2 h-4 w-4" 
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
