import * as React from 'react';
import { render, waitFor } from '@/tests/mocks/react-testing-library';
import { SettlementSummary } from '../SettlementSummary';
import type { Settlement } from '@/types/expenses';
import userEvent from '@testing-library/user-event';
import type { RenderResult } from '@testing-library/react';

// Type for test settlements
interface TestSettlement extends Settlement {
  created_at: string;
}

// Mock Supabase client for this specific test
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
    },
    from: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: null, error: null })))
    })
  }))
}));

type SetupResult = {
  user: ReturnType<typeof userEvent.setup>;
  onSettlementUpdated: jest.Mock;
} & RenderResult

// Setup test utilities
const setup = (settlements: TestSettlement[] = [], month: string = '2025-03'): SetupResult => {
  const user = userEvent.setup();
  const onSettlementUpdated = jest.fn();
  
  const utils = render(
    <SettlementSummary 
      settlements={settlements} 
      month={month} 
      onSettlementUpdated={onSettlementUpdated} 
    />
  );
  
  return {
    ...utils,
    user,
    onSettlementUpdated
  };
};

// Using our enhanced React Testing Library mock to handle React 19 compatibility
describe('SettlementSummary', () => {
  

const mockSettlements: TestSettlement[] = [
    {
      id: 'settlement-1',
      from: 'User1',
      to: 'User2',
      amount: 50.00,
      month: '2025-03',
      status: 'pending',
      created_at: '2025-03-20T12:00:00Z',
    },
    {
      id: 'settlement-2',
      from: 'User3',
      to: 'User1',
      amount: 25.50,
      month: '2025-03',
      status: 'completed',
      created_at: '2025-03-20T13:00:00Z',
    },
  ];

  it('renders settlements with correct formatting', async () => {
    const { getByTestId, getByText } = setup(mockSettlements);

    // Wait for React 19 concurrent rendering to complete
    await waitFor(() => {
      expect(getByTestId('settlement-summary')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check title
    expect(getByText('Settlements for March 2025')).toBeInTheDocument();

    // Check settlement items using data-testid attributes
    await waitFor(() => {
      const settlementItem0 = getByTestId('settlement-item-0');
      const settlementItem1 = getByTestId('settlement-item-1');
      
      // Verify settlement items exist
      expect(settlementItem0).toBeInTheDocument();
      expect(settlementItem1).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check user names using data-testid
    await waitFor(() => {
      const users0 = getByTestId('settlement-users-0');
      const users1 = getByTestId('settlement-users-1');
      
      expect(users0).toHaveTextContent('User1');
      expect(users0).toHaveTextContent('User2');
      expect(users1).toHaveTextContent('User3');
      expect(users1).toHaveTextContent('User1');
    }, { timeout: 5000 });

    // Check amounts and status badges with waitFor to handle React 19 concurrent rendering
    await waitFor(() => {
      expect(getByText('£50.00')).toBeInTheDocument();
      expect(getByText('£25.50')).toBeInTheDocument();
      
      // Check status badges
      expect(getByText('pending')).toBeInTheDocument();
      expect(getByText('completed')).toBeInTheDocument();
      
      // Check total
      expect(getByText('£75.50')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('handles empty settlements array', async () => {
    const { getByText, getByTestId } = setup([]);
    
    // Wait for React 19 concurrent rendering to complete
    await waitFor(() => {
      // Check empty state title and total
      expect(getByText('Settlements for March 2025')).toBeInTheDocument();
      expect(getByText('Total Settlements')).toBeInTheDocument();
      expect(getByText('£0.00')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify empty settlements list
    await waitFor(() => {
      const scrollArea = getByTestId('scroll-area');
      expect(scrollArea).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('renders with correct Shadcn UI structure', async () => {
    const { getByTestId, getAllByTestId, getByText } = setup(mockSettlements);

    // Wait for React 19 concurrent rendering to complete
    await waitFor(() => {
      // Check root component
      expect(getByTestId('settlement-summary')).toBeInTheDocument();
      
      // Check title content
      expect(getByText('Settlements for March 2025')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Check settlement items with waitFor to handle React 19 concurrent rendering
    await waitFor(() => {
      const settlementItems = getAllByTestId(/settlement-item-\d+/);
      expect(settlementItems.length).toBe(2);
      
      // Check user names
      const users = getAllByTestId(/settlement-users-\d+/);
      expect(users[0]).toHaveTextContent('User1');
    }, { timeout: 5000 });
  });
});
