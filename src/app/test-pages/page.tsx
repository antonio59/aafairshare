import Link from 'next/link'

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPagesIndex() {
  const testPages = [
    {
      id: 'buttons',
      title: 'Buttons',
      description: 'Test various button variants and states',
    },
    {
      id: 'cards',
      title: 'Cards',
      description: 'Test card layouts and variations',
    },
    {
      id: 'forms',
      title: 'Forms',
      description: 'Test form components and validation',
    },
    {
      id: 'dialogs',
      title: 'Dialogs',
      description: 'Test dialog components and interactions',
    },
    {
      id: 'responsive',
      title: 'Responsive',
      description: 'Test responsive layouts and behavior',
    },
    {
      id: 'theme',
      title: 'Theme',
      description: 'Test theme switching and theme colors',
    },
  ]

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">UI Test Pages</h1>
      <p className="text-muted-foreground mb-8">
        These pages are for visual regression testing to ensure UI components render correctly.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testPages.map((page) => (
          <Link href={`/test-pages/${page.id}`} key={page.id}>
            <Card className="hover:shadow-md transition-shadow" data-testid={`test-page-${page.id}`}>
              <CardHeader>
                <CardTitle>{page.title}</CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <p className="text-sm text-muted-foreground">View tests</p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
