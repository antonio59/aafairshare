'use client'

import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering theme components after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Theme System Tests</h1>
      
      <div className="flex justify-end mb-4">
        <div className="flex items-center space-x-2">
          <SunIcon className="h-4 w-4" />
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            data-testid="theme-toggle"
          />
          <MoonIcon className="h-4 w-4" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Background Colors</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background p-4 rounded-md border">background</div>
                <div className="bg-muted p-4 rounded-md">muted</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Foreground Colors</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-foreground text-background p-4 rounded-md">foreground</div>
                <div className="bg-muted-foreground text-background p-4 rounded-md">muted-foreground</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Primary Colors</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary text-primary-foreground p-4 rounded-md">primary</div>
                <div className="bg-primary-foreground text-primary p-4 rounded-md border">primary-foreground</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Secondary Colors</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary text-secondary-foreground p-4 rounded-md">secondary</div>
                <div className="bg-secondary-foreground text-secondary p-4 rounded-md border">secondary-foreground</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Accent Colors</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-accent text-accent-foreground p-4 rounded-md">accent</div>
                <div className="bg-accent-foreground text-accent p-4 rounded-md border">accent-foreground</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Destructive Colors</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-destructive text-destructive-foreground p-4 rounded-md">destructive</div>
                <div className="bg-destructive-foreground text-destructive p-4 rounded-md border">destructive-foreground</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Component Theming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Buttons</p>
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            
            <div className="h-px bg-border w-full" />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Cards</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-card text-card-foreground p-4 rounded-md border">Card</div>
                <div className="bg-card text-card-foreground p-4 rounded-md border border-primary">Card with border</div>
              </div>
            </div>
            
            <div className="h-px bg-border w-full" />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Form Elements</p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="theme-mode" />
                  <Label htmlFor="theme-mode">Switch</Label>
                </div>
                <input
                  type="text"
                  placeholder="Input"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Select option</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Text Colors & Contrast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Default Text</h2>
                <p>This is the default text color for the current theme.</p>
                <p className="text-sm text-muted-foreground">This is muted text, used for less important information.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary text-primary-foreground p-4 rounded-md">
                  <h3 className="font-medium">Primary Background</h3>
                  <p className="text-sm">Text on primary background should be readable.</p>
                </div>
                
                <div className="bg-secondary text-secondary-foreground p-4 rounded-md">
                  <h3 className="font-medium">Secondary Background</h3>
                  <p className="text-sm">Text on secondary background should be readable.</p>
                </div>
                
                <div className="bg-accent text-accent-foreground p-4 rounded-md">
                  <h3 className="font-medium">Accent Background</h3>
                  <p className="text-sm">Text on accent background should be readable.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-destructive text-destructive-foreground p-4 rounded-md">
                  <h3 className="font-medium">Destructive Background</h3>
                  <p className="text-sm">Error messages and warnings should be clearly visible.</p>
                </div>
                
                <div className="bg-muted text-muted-foreground p-4 rounded-md">
                  <h3 className="font-medium">Muted Background</h3>
                  <p className="text-sm">Subtle backgrounds should have appropriate text contrast.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
