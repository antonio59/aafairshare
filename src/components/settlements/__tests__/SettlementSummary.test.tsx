import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { SettlementSummary } from '../SettlementSummary';
import type { Settlement } from '@/types/expenses';

// Mock components are now defined in jest.setup.ts
describe('SettlementSummary', () => {
  const mockSettlements: Settlement[] = [
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
    render(<SettlementSummary settlements={mockSettlements} month="2025-03" />);

    // Check title
    expect(screen.getByText('Settlements for March 2025')).toBeInTheDocument();

    // Check settlement items using data-testid attributes
    const _settlementItem0 = screen.getByTestId('settlement-item-0');
    const _settlementItem1 = screen.getByTestId('settlement-item-1');
    
    // Verify settlement items exist
    expect(_settlementItem0).toBeInTheDocument();
    expect(_settlementItem1).toBeInTheDocument();
    
    // Check user names using data-testid
    const users0 = screen.getByTestId('settlement-users-0');
    const users1 = screen.getByTestId('settlement-users-1');
    
    expect(users0).toHaveTextContent('User1');
    expect(users0).toHaveTextContent('User2');
    expect(users1).toHaveTextContent('User3');
    expect(users1).toHaveTextContent('User1');

    // Check amounts
    expect(screen.getByText('£50.00')).toBeInTheDocument();
    expect(screen.getByText('£25.50')).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();

    // Check total
    expect(screen.getByText('£75.50')).toBeInTheDocument();
  });

  it('handles empty settlements array', () => {
    render(<SettlementSummary settlements={[]} month="2025-03" />);
    
    // Check empty state title and total
    expect(screen.getByText('Settlements for March 2025')).toBeInTheDocument();
    expect(screen.getByText('Total Settlements')).toBeInTheDocument();
    expect(screen.getByText('£0.00')).toBeInTheDocument();
    
    // Verify empty settlements list
    const scrollArea = screen.getByTestId('scroll-area');
    const settlementsList = scrollArea.querySelector('.space-y-4');
    expect(settlementsList).toBeInTheDocument();
    expect(settlementsList?.children.length).toBe(0);
  });

  it('renders with correct Shadcn UI structure', () => {
    render(<SettlementSummary settlements={mockSettlements} month="2025-03" />);

    // Verify Shadcn UI component hierarchy
    const card = screen.getByTestId('card');
    const cardHeader = screen.getByTestId('card-header');
    const cardContent = screen.getByTestId('card-content');
    const scrollArea = screen.getByTestId('scroll-area');

    // Check component presence
    expect(card).toBeInTheDocument();
    expect(cardHeader).toBeInTheDocument();
    expect(cardContent).toBeInTheDocument();
    expect(scrollArea).toBeInTheDocument();

    // Verify component nesting
    expect(card).toContainElement(cardHeader);
    expect(card).toContainElement(cardContent);
    expect(cardContent).toContainElement(scrollArea);

    // Verify content structure
    expect(cardHeader).toHaveTextContent('Settlements for March 2025');
    
    // Check settlement items
    const settlementItems = screen.getAllByTestId(/settlement-item-\d+/);
    expect(settlementItems.length).toBe(2);
    
    // Check user names
    const users = screen.getAllByTestId(/settlement-users-\d+/);
    expect(users[0]).toHaveTextContent('User1');
    expect(users[0]).toHaveTextContent('User2');
    expect(users[1]).toHaveTextContent('User3');
    expect(users[1]).toHaveTextContent('User1');
  });
});
