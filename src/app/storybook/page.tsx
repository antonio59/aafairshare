'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function StorybookPage() {
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Component Library</h1>
      <p className="text-gray-500 mb-8">
        A collection of reusable UI components for the AAFairShare application.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="buttons" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ComponentPreview
              title="Primary Button"
              description="Used for primary actions"
              code="<Button>Primary Button</Button>"
            >
              <div className="flex flex-col gap-4">
                <Button>Primary Button</Button>
                <Button disabled>Disabled</Button>
              </div>
            </ComponentPreview>

            <ComponentPreview
              title="Secondary Button"
              description="Used for secondary actions"
              code="<Button variant='secondary'>Secondary Button</Button>"
            >
              <div className="flex flex-col gap-4">
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="secondary" disabled>Disabled</Button>
              </div>
            </ComponentPreview>

            <ComponentPreview
              title="Outline Button"
              description="Used for less prominent actions"
              code="<Button variant='outline'>Outline Button</Button>"
            >
              <div className="flex flex-col gap-4">
                <Button variant="outline">Outline Button</Button>
                <Button variant="outline" disabled>Disabled</Button>
              </div>
            </ComponentPreview>

            <ComponentPreview
              title="Ghost Button"
              description="Used for the least prominent actions"
              code="<Button variant='ghost'>Ghost Button</Button>"
            >
              <div className="flex flex-col gap-4">
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="ghost" disabled>Disabled</Button>
              </div>
            </ComponentPreview>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ComponentPreview
              title="Basic Card"
              description="Used for content grouping"
              code={`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>Card Content</CardContent>
  <CardFooter>Card Footer</CardFooter>
</Card>`}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card Description</CardDescription>
                </CardHeader>
                <CardContent>Card Content</CardContent>
                <CardFooter>Card Footer</CardFooter>
              </Card>
            </ComponentPreview>

            <ComponentPreview
              title="Interactive Card"
              description="Card with interactive elements"
              code={`<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
    <CardDescription>Enter your credentials</CardDescription>
  </CardHeader>
  <CardContent>
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Password" />
      </div>
    </form>
  </CardContent>
  <CardFooter>
    <Button>Login</Button>
  </CardFooter>
</Card>`}
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Enter your credentials</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="Password" />
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button>Login</Button>
                </CardFooter>
              </Card>
            </ComponentPreview>
          </div>
        </TabsContent>

        <TabsContent value="inputs" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ComponentPreview
              title="Basic Input"
              description="Used for text input"
              code="<Input placeholder='Basic input' />"
            >
              <div className="flex flex-col gap-4">
                <Input placeholder="Basic input" />
                <Input placeholder="Disabled input" disabled />
              </div>
            </ComponentPreview>

            <ComponentPreview
              title="Input with Label"
              description="Input with associated label"
              code={`<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="Email" />
</div>`}
            >
              <div className="space-y-2">
                <Label htmlFor="labeledInput">Email</Label>
                <Input id="labeledInput" placeholder="Email" />
              </div>
            </ComponentPreview>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ComponentPreview
              title="Default Badge"
              description="Used for status indicators"
              code="<Badge>Badge</Badge>"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </ComponentPreview>

            <ComponentPreview
              title="Badge Variants"
              description="Different badge variants"
              code={`<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>New</Badge>
                  <span>New feature</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">In Progress</Badge>
                  <span>Task in progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Archived</Badge>
                  <span>Archived content</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Error</Badge>
                  <span>Error state</span>
                </div>
              </div>
            </ComponentPreview>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ComponentPreviewProps {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}

function ComponentPreview({ title, description, code, children }: ComponentPreviewProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-muted/40">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-6 flex items-center justify-center bg-background">
        {children}
      </div>
      <div className="border-t">
        <Button
          variant="ghost"
          className="w-full text-xs h-9 rounded-none"
          onClick={() => setShowCode(!showCode)}
        >
          {showCode ? 'Hide Code' : 'Show Code'}
        </Button>
        {showCode && (
          <div className="p-4 bg-muted font-mono text-xs overflow-x-auto">
            <pre>{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
