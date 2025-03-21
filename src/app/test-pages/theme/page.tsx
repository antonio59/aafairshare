'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

/**
 * Theme Test Page
 * 
 * This page tests theme switching between light and dark mode
 * to verify Tailwind CSS 4 theming capabilities with React 19.
 */
export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Only show the UI after component has mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Theme System Test</h1>
      
      <div className="flex items-center justify-between mb-8 p-4 border rounded-lg">
        <div>
          <h2 className="text-xl font-semibold">Current Theme: {theme}</h2>
          <p className="text-muted-foreground">Toggle between light and dark mode</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label htmlFor="theme-toggle">Toggle Theme</Label>
          <Switch 
            id="theme-toggle"
            data-testid="theme-toggle"
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theme Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-background border rounded-md">background</div>
                <div className="p-4 bg-foreground text-background border rounded-md">foreground</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-card border rounded-md">card</div>
                <div className="p-4 bg-card-foreground text-background border rounded-md">card-foreground</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-primary text-primary-foreground border rounded-md">primary</div>
                <div className="p-4 bg-primary-foreground text-primary border rounded-md">primary-foreground</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-secondary text-secondary-foreground border rounded-md">secondary</div>
                <div className="p-4 bg-secondary-foreground text-secondary border rounded-md">secondary-foreground</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-muted text-muted-foreground border rounded-md">muted</div>
                <div className="p-4 bg-muted-foreground text-muted border rounded-md">muted-foreground</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-accent text-accent-foreground border rounded-md">accent</div>
                <div className="p-4 bg-accent-foreground text-accent border rounded-md">accent-foreground</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-destructive text-destructive-foreground border rounded-md">destructive</div>
                <div className="p-4 bg-destructive-foreground text-destructive border rounded-md">destructive-foreground</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Component Theme Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Component Theme Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Cards</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded-md p-3 bg-card">
                  <p className="font-medium">Card</p>
                  <p className="text-sm text-muted-foreground">Card with default background</p>
                </div>
                <div className="border rounded-md p-3 bg-muted">
                  <p className="font-medium">Muted Card</p>
                  <p className="text-sm text-muted-foreground">Card with muted background</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Form Elements</h3>
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
