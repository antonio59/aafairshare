import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettlementCard } from '../SettlementCard';
import { Settlement } from '@/types/expenses';

// Mock date-fns to avoid inconsistencies in tests
jest.mock('date-fns', () => ({
  format: jest.fn().mockImplementation(() => 'March 15, 2025'),
}));

// Mock the cn utility
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(' ')),
}));

// Mock the card components
type CardComponentProps = {
  children: React.ReactNode;
  className?: string;
};

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: CardComponentProps) => <div className={className} data-testid="card">{children}</div>,
  CardHeader: ({ children, className }: CardComponentProps) => <div className={className} data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: CardComponentProps) => <div className={className} data-testid="card-title">{children}</div>,
  CardDescription: ({ children, className }: CardComponentProps) => <div className={className} data-testid="card-description">{children}</div>,
  CardContent: ({ children, className }: CardComponentProps) => <div className={className} data-testid="card-content">{children}</div>,
  CardFooter: ({ children, className }: CardComponentProps) => <div className={className} data-testid="card-footer">{children}</div>,
}));

// Mock the badge component
type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, onClick }: BadgeProps) => <span className={className} onClick={onClick} data-testid="badge">{children}</span>,
}));

// Mock the tooltip components
type TooltipProps = {
  children: React.ReactNode;
};

type TooltipTriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
};

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: TooltipProps) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: TooltipProps) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: TooltipProps) => <div data-testid="tooltip-provider">{children}</div>,
  TooltipTrigger: ({ children, asChild }: TooltipTriggerProps) => <div data-testid="tooltip-trigger" data-as-child={asChild}>{children}</div>,
}));

describe('SettlementCard', () => {
  const mockSettlement: Settlement = {
    id: 'settlement-123',
    from: 'Alice',
    to: 'Bob',
    amount: 50.75,
    month: '2025-03',
    status: 'pending',
    created_at: '2025-03-15T12:00:00Z',
    updated_at: '2025-03-15T14:30:00Z',
  };

  const mockCompletedSettlement: Settlement = {
    ...mockSettlement,
    status: 'completed',
  };

  const mockZeroSettlement: Settlement = {
    ...mockSettlement,
    from: '',
    to: '',
    amount: 0,
  };

  it('renders settlement information correctly', () => {
    render(<SettlementCard settlement={mockSettlement} />);
    
    // Check if the essential settlement info is rendered
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('$50.75')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('Created on March 15, 2025')).toBeInTheDocument();
  });
  
  it('renders zero amount settlement with appropriate message', () => {
    render(<SettlementCard settlement={mockZeroSettlement} />);
    
    // Check for zero amount message
    expect(screen.getByText('No settlement needed for this period')).toBeInTheDocument();
  });
  
  it('displays the completed status with green styling', () => {
    render(<SettlementCard settlement={mockCompletedSettlement} />);
    
    // Check for completed status
    const statusBadge = screen.getByText('completed');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge.className).toContain('bg-green-100');
    expect(statusBadge.className).toContain('text-green-800');
  });
  
  it('calls onStatusChange callback when badge is clicked', () => {
    const mockOnStatusChange = jest.fn();
    render(<SettlementCard 
      settlement={mockSettlement} 
      onStatusChange={mockOnStatusChange} 
    />);
    
    // Click the status badge
    fireEvent.click(screen.getByText('pending'));
    
    // Check if callback was called with correct parameters
    expect(mockOnStatusChange).toHaveBeenCalledWith('settlement-123', 'completed');
  });
  
  it('toggles status from completed to pending when clicked', () => {
    const mockOnStatusChange = jest.fn();
    render(<SettlementCard 
      settlement={mockCompletedSettlement} 
      onStatusChange={mockOnStatusChange} 
    />);
    
    // Click the status badge
    fireEvent.click(screen.getByText('completed'));
    
    // Check if callback was called with correct parameters
    expect(mockOnStatusChange).toHaveBeenCalledWith('settlement-123', 'pending');
  });
  
  it('applies custom className when provided', () => {
    render(<SettlementCard 
      settlement={mockSettlement} 
      className="custom-class"
    />);
    
    // Get the card element and check for the custom class
    const cardElement = screen.getByText('Alice').closest('.custom-class');
    expect(cardElement).toBeInTheDocument();
  });
  
  it('shows ID in truncated form', () => {
    render(<SettlementCard settlement={mockSettlement} />);
    
    // Check for truncated ID
    expect(screen.getByText('ID: settleme...')).toBeInTheDocument();
  });
  
  it('shows updated date when available', () => {
    render(<SettlementCard settlement={mockSettlement} />);
    
    // Check for updated date text
    expect(screen.getByText('Updated: March 15, 2025')).toBeInTheDocument();
  });
});
