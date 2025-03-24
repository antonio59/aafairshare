'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

export default function FormsTestPage() {
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  
  const validateForm = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters')
    } else {
      setUsernameError('')
      alert('Form submitted successfully!')
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Form Component Tests</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card data-testid="validated-form">
          <CardHeader>
            <CardTitle>Validated Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={validateForm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={usernameError ? 'border-red-500' : ''}
                />
                {usernameError && (
                  <p className="text-sm text-red-500">{usernameError}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@email.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms">Accept terms and conditions</Label>
              </div>
              
              <Button type="submit" className="w-full">
                Register Account
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card data-testid="input-variants">
          <CardHeader>
            <CardTitle>Input Variants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="standard">Standard Input</Label>
              <Input id="standard" placeholder="Standard input" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="disabled">Disabled Input</Label>
              <Input id="disabled" disabled placeholder="Disabled input" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="with-icon" className="flex items-center gap-1">
                With Icon
              </Label>
              <div className="relative">
                <Input id="with-icon" placeholder="Search..." />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  🔍
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="error">Error State</Label>
              <Input id="error" className="border-red-500" placeholder="Error state" />
              <p className="text-sm text-red-500">This field has an error</p>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="select-checkbox">
          <CardHeader>
            <CardTitle>Select & Checkbox Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Select Theme</Label>
              <Select>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Notification Preferences</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="emails" />
                  <Label htmlFor="emails">Email notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sms" defaultChecked />
                  <Label htmlFor="sms">SMS notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="push" disabled />
                  <Label htmlFor="push" className="text-muted-foreground">
                    Push notifications (unavailable)
                  </Label>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Theme Mode</Label>
              <div className="flex items-center space-x-2">
                <Switch id="dark-mode" />
                <Label htmlFor="dark-mode">Dark Mode</Label>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Expense Splitting</Label>
              <RadioGroup defaultValue="50/50">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="50/50" id="equal" />
                  <Label htmlFor="equal">Equal (50/50)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Custom Split</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
