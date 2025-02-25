# Components Documentation

This document provides an overview of the key components in the application.

## UI Components

### EnhancedSelect
A highly accessible select component built with Radix UI's Command component.

```tsx
import { EnhancedSelect } from '@/components/ui/enhanced-select';

<EnhancedSelect
  value={selectedValue}
  onChange={handleChange}
  options={options}
  placeholder="Select an option"
  searchPlaceholder="Search..."
  groupBy="category"
  disabled={false}
/>
```

**Features:**
- Keyboard navigation
- Search functionality
- Option grouping
- Custom icons
- Loading states
- Error handling

### TagInput
A flexible tag input component built with Radix UI's Command component.

```tsx
import { TagInput } from '@/components/ui/tag-input';

<TagInput
  value={tags}
  onChange={handleTagChange}
  placeholder="Add tags..."
  maxTags={10}
  allowDuplicates={false}
  disabled={false}
/>
```

**Features:**
- Keyboard navigation
- Custom colors
- Max tags limit
- Loading states
- Error handling
- Duplicate prevention

### ExportButton
A flexible export button component with multiple format support.

```tsx
import { ExportButton } from '@/components/ui/export-button';

<ExportButton
  data={{
    data: exportData,
    filename: 'export',
    title: 'Export Title',
    description: 'Export Description'
  }}
  onExport={handleExport}
  disabled={false}
/>
```

**Features:**
- Multiple export formats (JSON, PDF, Excel)
- Loading states
- Toast notifications
- Error handling
- Custom styling

### MonthSelector
A date picker component focused on month selection.

```tsx
import { MonthSelector } from '@/components/ui/month-selector';

<MonthSelector
  value={selectedMonth}
  onChange={handleMonthChange}
  minDate={new Date('2020-01-01')}
  maxDate={new Date('2025-12-31')}
  disabled={false}
/>
```

**Features:**
- Month and year selection
- Min/max date constraints
- Keyboard navigation
- Accessibility
- Custom styling

### UserSelect
A comprehensive user authentication component.

```tsx
import { UserSelect } from '@/components/ui/user-select';

<UserSelect
  user={currentUser}
  onLogin={handleLogin}
  onLogout={handleLogout}
  onResetPassword={handleResetPassword}
/>
```

**Features:**
- Login form
- Password reset flow
- Form validation with Zod
- Toast notifications
- Loading states
- Error handling
- Accessibility

## Common Features Across Components

### Accessibility
All components are built with accessibility in mind:
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

### Error Handling
Components include comprehensive error handling:
- Form validation
- API error handling
- User feedback via toast notifications
- Error boundaries

### Performance
Components are optimized for performance:
- React.memo for expensive renders
- Proper dependency arrays in hooks
- Dynamic imports for large dependencies
- Debounced search inputs

### Styling
Components use a consistent styling approach:
- Tailwind CSS for styling
- CSS variables for theming
- Responsive design
- Dark mode support

### TypeScript
All components are written in TypeScript:
- Strong type definitions
- Interface exports
- Generic components where appropriate
- Proper type inference

## Best Practices

1. **State Management**
   - Use controlled components when possible
   - Implement proper loading states
   - Handle error states gracefully

2. **Performance**
   - Memoize expensive computations
   - Use proper dependency arrays in hooks
   - Implement virtual scrolling for long lists

3. **Accessibility**
   - Include proper ARIA attributes
   - Support keyboard navigation
   - Test with screen readers

4. **Testing**
   - Write unit tests for components
   - Include integration tests
   - Test edge cases and error states

5. **Documentation**
   - Document props and their types
   - Include usage examples
   - Document any side effects

## Contributing

When creating new components or modifying existing ones:

1. Follow the established patterns
2. Maintain TypeScript types
3. Include proper documentation
4. Add necessary tests
5. Consider accessibility
6. Optimize for performance

For more detailed information about specific components, check their respective source files.
