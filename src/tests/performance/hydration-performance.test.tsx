// Remove unused imports to fix lint errors
import React, { useState, useTransition, useEffect } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { measureRenderTime, trackHydrationPerformance } from '@/utils/performance-metrics';

/**
 * Component that uses React 19 features to test hydration performance
 * This component demonstrates React 19's improved concurrent rendering capabilities
 */
function HydrationTestComponent() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<string[]>([]);
  
  // Track hydration performance
  useEffect(() => {
    const tracker = trackHydrationPerformance('HydrationTestComponent');
    
    // Mark component as hydrated after initial render
    const timeoutId = setTimeout(() => {
      tracker.markHydrated();
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  const handleAddItems = () => {
    // Use React 19's startTransition for better UX during expensive updates
    startTransition(() => {
      // Add 1000 items in a transition
      setItems([...Array(1000)].map((_, i) => `Item ${i + 1}`));
    });
  };
  
  return (
    <div>
      <h2>Hydration Test</h2>
      <div>
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count}
        </button>
      </div>
      <div>
        <button 
          onClick={handleAddItems} 
          disabled={isPending}
          data-testid="add-items-button"
        >
          {isPending ? 'Adding...' : 'Add 1000 Items'}
        </button>
      </div>
      {isPending ? (
        <p>Loading items...</p>
      ) : (
        <ul className="max-h-40 overflow-auto">
          {items.slice(0, 10).map((item, i) => (
            <li key={i} data-testid={`item-${i}`}>{item}</li>
          ))}
          {items.length > 10 && (
            <li data-testid="more-items">...and {items.length - 10} more items</li>
          )}
        </ul>
      )}
    </div>
  );
}

describe('React 19 Hydration Performance', () => {
  test('Component hydrates and renders efficiently', async () => {
    const endMeasure = measureRenderTime('HydrationTestComponent');
    
    render(<HydrationTestComponent />);
    
    const renderTime = endMeasure();
    console.log(`Initial render time: ${renderTime}ms`);
    
    // Basic functionality test
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    // Test counter update (non-transition)
    const updateMeasure = measureRenderTime('CounterUpdate');
    fireEvent.click(screen.getByText('Count: 0'));
    const updateTime = updateMeasure();
    console.log(`Counter update time: ${updateTime}ms`);
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
    
    // Test transition
    const transitionMeasure = measureRenderTime('AddItemsTransition');
    
    act(() => {
      fireEvent.click(screen.getByTestId('add-items-button'));
    });
    
    // Should show loading state during transition
    expect(screen.getByText('Loading items...')).toBeInTheDocument();
    
    // Wait for transition to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    const transitionTime = transitionMeasure();
    console.log(`Transition time: ${transitionTime}ms`);
    
    // Verify items were added
    expect(screen.queryByText('Loading items...')).not.toBeInTheDocument();
    expect(screen.getByTestId('more-items')).toBeInTheDocument();
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
  });
});
