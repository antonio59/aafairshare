# AAFairshare Styling System

This document outlines the styling approach for the AAFairshare project.

## Font System

We use Next.js Font system for optimized font loading:

- **Primary Font**: Inter (sans-serif) 
- **Monospace Font**: Inconsolata (monospace)

The font loading is configured in `src/app/layout.tsx` and the CSS variables are defined in `src/styles/globals.css`. These fonts are then accessible via Tailwind's font family utilities:

```tsx
<p className="font-sans">This uses Inter</p>
<code className="font-mono">This uses Inconsolata</code>
```

## CSS Organization

The CSS is organized into the following structure:

```
src/styles/
├── globals.css           # Main CSS file with Tailwind imports and CSS variables
├── tokens.ts             # Design tokens as TypeScript constants
├── components/           # Component-specific styles
│   └── navbar.css        # Styles for navbar component
└── utilities/            # Utility styles
    ├── animations.css    # Custom animations
    └── accessibility.css # Accessibility enhancements
```

### Design Tokens

Design tokens are defined in `src/styles/tokens.ts` and can be accessed via the `t()` function:

```tsx
import { t } from '@/styles/tokens';

// In your component
<div style={{ marginTop: t('spacing.4') }}>
  Spaced content
</div>
```

## Theming

The theme is defined using CSS variables in `src/styles/globals.css` with both light and dark mode support. The variables follow this pattern:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* Other variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* Dark mode variables */
}
```

## Components

UI components in `src/components/ui/` follow these patterns:

1. **Variants**: Using `class-variance-authority` (cva) for component variants
2. **Class Merging**: Using `cn()` utility to merge Tailwind classes
3. **TypeScript**: Strong typing for all component props
4. **Accessibility**: ARIA attributes and keyboard navigation support

### Component Exports

Components are exported with PascalCase names following React conventions:

```tsx
// ✅ Correct imports
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

The lowercase exports (e.g., `button`, `card`) are for tooling compatibility only and should not be used directly.

## Accessibility Enhancements

The system includes several accessibility improvements:

1. **Skip Links**: Skip to content link for keyboard users
2. **Focus Styles**: Enhanced focus styles for keyboard navigation
3. **Screen Reader Support**: Screen reader only text via `.sr-only` utility
4. **ARIA Attributes**: Proper ARIA labeling on interactive elements
5. **Keyboard Navigation**: All interactive elements are keyboard accessible

## Best Practices

1. Use Tailwind's utility classes for most styling needs
2. Create custom components for repeated UI patterns
3. Use the design tokens for consistent spacing, typography, and colors
4. Ensure all interactive elements have proper focus and hover states
5. Test components in both light and dark modes
6. Follow the accessibility guidelines in the UI components
7. Use semantic HTML elements whenever possible