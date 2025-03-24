# Zustand State Management

This directory contains the Zustand state management stores for the AAFairShare application. This README provides an overview of the store structure, patterns, and best practices.

## Overview

Zustand is a lightweight state management library for React that offers a simpler alternative to Redux or Context API. Key benefits include:

- Minimal boilerplate code
- No providers needed at the top level
- Fine-grained re-renders
- Middleware support

## Store Structure

### 1. Expense Store (`expenses.ts`)

Manages expense data and operations:
- Fetching expenses
- Adding new expenses 
- Updating existing expenses
- Deleting expenses
- Tracking loading states and errors

```typescript
// Example usage
import { useExpenseStore } from '@/store';

function MyComponent() {
  const { 
    expenses, 
    isLoading, 
    fetchExpenses, 
    addExpense 
  } = useExpenseStore();
  
  // Use the store data and actions
}
```

### 2. Category Store (`categories.ts`)

Manages category data and operations:
- Fetching categories
- Adding new categories
- Updating existing categories
- Deleting categories
- Tracking loading states and errors

### 3. UI Store (`ui.ts`) 

Manages UI state:
- Sidebar visibility
- Active modals
- Theme preferences
- Notifications/alerts

## Best Practices

### 1. Store Organization

- **Single Responsibility**: Each store should focus on a specific domain (expenses, categories, UI, etc.)
- **Modular Exports**: Export stores from a central index.ts file

### 2. Action Patterns

- **Async Actions**: Handle loading states and errors consistently
- **Optimistic Updates**: Update the UI immediately, then revert if the server request fails
- **Error Handling**: Properly capture and expose errors

```typescript
// Example of proper async action pattern
const fetchItems = async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await fetch('/api/items');
    
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    
    const data = await response.json();
    set({ items: data, isLoading: false });
  } catch (error) {
    set({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred', 
      isLoading: false 
    });
  }
};
```

### 3. State Updates

- **Immutable Updates**: Always use immutable patterns when updating state
- **Selective Updates**: Only update the specific parts of state that changed

```typescript
// Example of immutable array update
set(state => ({
  items: state.items.map(item => 
    item.id === updatedItem.id ? updatedItem : item
  )
}));
```

### 4. Using Middleware

- **devtools**: For Redux DevTools integration (helpful during development)
- **persist**: For persisting state to localStorage
- **immer**: For easier immutable state updates (optional)

## Using Stores in Components

### Selecting State

Only select the specific state pieces you need in a component to avoid unnecessary re-renders:

```typescript
// Good - select only what you need
const expenses = useExpenseStore(state => state.expenses);
const isLoading = useExpenseStore(state => state.isLoading);

// Not ideal - selects entire store, component will re-render for any state change
const { expenses, isLoading } = useExpenseStore();
```

### Async Actions

When using async actions, handle loading and error states appropriately:

```typescript
const { addExpense, isLoading, error } = useExpenseStore();

// In your component
const handleSubmit = async (data) => {
  try {
    await addExpense(data);
    // Success handling
  } catch (err) {
    // Error handling (if needed beyond the store)
  }
};

// In your UI
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage message={error} />}
```

## Advanced Usage

### Combining Stores

You can use multiple stores together in a component:

```typescript
function MyComponent() {
  const expenses = useExpenseStore(state => state.expenses);
  const categories = useCategoryStore(state => state.categories);
  const { showNotification } = useUIStore();
  
  // Use data from multiple stores
}
```

### Custom Hooks

For complex logic involving multiple stores, consider creating custom hooks:

```typescript
function useExpenseWithCategories() {
  const expenses = useExpenseStore(state => state.expenses);
  const categories = useCategoryStore(state => state.categories);
  
  // Combine data from both stores
  const expensesWithCategoryNames = expenses.map(expense => ({
    ...expense,
    categoryName: categories.find(c => c.id === expense.category_id)?.name || 'Uncategorized'
  }));
  
  return expensesWithCategoryNames;
}
```

## Testing Stores

When testing components that use Zustand stores, you can mock the store:

```typescript
// In your test file
import { useExpenseStore } from '@/store';

// Mock the store
jest.mock('@/store', () => ({
  useExpenseStore: jest.fn(),
}));

describe('MyComponent', () => {
  beforeEach(() => {
    useExpenseStore.mockImplementation(() => ({
      expenses: [{ id: '1', amount: 100 }],
      isLoading: false,
      fetchExpenses: jest.fn(),
    }));
  });
  
  // Your tests...
});
```