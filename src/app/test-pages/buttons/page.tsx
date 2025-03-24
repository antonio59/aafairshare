import { ArrowRight, LoaderCircle, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ButtonsTestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Button Component Tests</h1>
      
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button data-testid="button-default">Default</Button>
            <Button variant="destructive" data-testid="button-destructive">Destructive</Button>
            <Button variant="outline" data-testid="button-outline">Outline</Button>
            <Button variant="secondary" data-testid="button-secondary">Secondary</Button>
            <Button variant="ghost" data-testid="button-ghost">Ghost</Button>
            <Button variant="link" data-testid="button-link">Link</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Button Sizes</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Button data-testid="button-size-default">Default Size</Button>
            <Button size="sm" data-testid="button-size-sm">Small</Button>
            <Button size="lg" data-testid="button-size-lg">Large</Button>
            <Button size="icon" data-testid="button-size-icon"><Plus /></Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Button States</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button data-testid="button-normal">Normal</Button>
            <Button disabled data-testid="button-disabled">Disabled</Button>
            <Button disabled>
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              <span data-testid="button-loading">Loading</span>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Buttons with Icons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button data-testid="button-with-left-icon">
              <Plus className="mr-2 h-4 w-4" /> New Item
            </Button>
            <Button data-testid="button-with-right-icon">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
