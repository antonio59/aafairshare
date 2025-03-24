import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function CardsTestPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Card Component Tests</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card data-testid="basic-card">
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>A standard card with header, content, and footer</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card. It can contain any kind of content like text, lists, or other components.</p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </CardFooter>
        </Card>
        
        <Card data-testid="content-only-card">
          <CardContent className="pt-6">
            <p>This is a content-only card without a formal header or footer. Sometimes you just need a simple container without the extra structure.</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary transition-colors cursor-pointer" data-testid="interactive-card">
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>This card has hover and active states</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hover over this card to see it change. Interactive cards are useful for clickable content or navigation.</p>
          </CardContent>
        </Card>
        
        <Card data-testid="image-card">
          <div className="h-40 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-500">Placeholder Image</span>
          </div>
          <CardHeader>
            <CardTitle>Card With Image</CardTitle>
            <CardDescription>Cards often contain images or media</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card demonstrates how to include an image or other media with card content.</p>
          </CardContent>
        </Card>
        
        <Card data-testid="nested-card">
          <CardHeader>
            <CardTitle>Nested Cards</CardTitle>
            <CardDescription>Cards can contain other cards</CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">Nested Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is a card nested inside another card.</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        
        <Card className="bg-primary text-primary-foreground" data-testid="custom-styled-card">
          <CardHeader>
            <CardTitle>Custom Styled Card</CardTitle>
            <CardDescription className="text-primary-foreground/80">Cards can have custom styling</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card uses a custom background and text color to make it stand out.</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary">Action</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
