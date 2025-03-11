import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

// Example UI components to test with snapshots
// The actual import paths should be adjusted based on your project structure
import { ExpenseSummary } from '../../features/expenses/components/ExpenseSummary';
import { SettlementCard } from '../../features/settlements/components/SettlementCard';
import { CategoryBadge } from '../../features/shared/components/CategoryBadge';

describe('UI Component Snapshots', () => {
  describe('ExpenseSummary Component', () => {
    it('should render correctly with basic expense details', () => {
      const expense = {
        id: '123',
        title: 'Team Lunch',
        amount: 120.5,
        date: '2023-05-15',
        category: 'food',
        payer: {
          id: 'user1',
          name: 'Jane Doe'
        },
        participants: [
          { id: 'user1', name: 'Jane Doe', amount: 60.25 },
          { id: 'user2', name: 'John Smith', amount: 60.25 }
        ]
      };
      
      const { container } = render(<ExpenseSummary expense={expense} />);
      expect(container).toMatchSnapshot();
    });
    
    it('should render correctly with receipt', () => {
      const expense = {
        id: '456',
        title: 'Office Supplies',
        amount: 85.99,
        date: '2023-05-20',
        category: 'shopping',
        payer: {
          id: 'user2',
          name: 'John Smith'
        },
        participants: [
          { id: 'user1', name: 'Jane Doe', amount: 42.995 },
          { id: 'user2', name: 'John Smith', amount: 42.995 }
        ],
        receipt: 'https://example.com/receipts/office-supplies.jpg'
      };
      
      const { container } = render(<ExpenseSummary expense={expense} />);
      expect(container).toMatchSnapshot();
    });
  });
  
  describe('SettlementCard Component', () => {
    it('should render correctly with basic settlement details', () => {
      const settlement = {
        id: '789',
        name: 'Weekend Trip',
        description: 'Trip to the mountains',
        date: '2023-06-10',
        status: 'active',
        totalAmount: 450.75,
        participants: [
          { id: 'user1', name: 'Jane Doe' },
          { id: 'user2', name: 'John Smith' },
          { id: 'user3', name: 'Bob Johnson' }
        ]
      };
      
      const { container } = render(<SettlementCard settlement={settlement} />);
      expect(container).toMatchSnapshot();
    });
    
    it('should render correctly for completed settlement', () => {
      const settlement = {
        id: '101',
        name: 'Dinner Party',
        description: 'Monthly dinner with friends',
        date: '2023-06-05',
        status: 'completed',
        totalAmount: 210.30,
        participants: [
          { id: 'user1', name: 'Jane Doe' },
          { id: 'user2', name: 'John Smith' }
        ]
      };
      
      const { container } = render(<SettlementCard settlement={settlement} />);
      expect(container).toMatchSnapshot();
    });
  });
  
  describe('CategoryBadge Component', () => {
    it('should render food category correctly', () => {
      const { container } = render(<CategoryBadge category="food" />);
      expect(container).toMatchSnapshot();
    });
    
    it('should render transportation category correctly', () => {
      const { container } = render(<CategoryBadge category="transportation" />);
      expect(container).toMatchSnapshot();
    });
    
    it('should render shopping category correctly', () => {
      const { container } = render(<CategoryBadge category="shopping" />);
      expect(container).toMatchSnapshot();
    });
    
    it('should render entertainment category correctly', () => {
      const { container } = render(<CategoryBadge category="entertainment" />);
      expect(container).toMatchSnapshot();
    });
    
    it('should render other category correctly', () => {
      const { container } = render(<CategoryBadge category="other" />);
      expect(container).toMatchSnapshot();
    });
  });
}); 