import { render, screen } from '@testing-library/react';
import { SettlementSkeleton, SettlementSkeletonGroup } from '../SettlementSkeleton';

// Mock cn utility to avoid issues with Tailwind class merging in tests
jest.mock('@/lib/utils', () => ({
  cn: (...inputs: (string | boolean | undefined)[]) => inputs.filter(Boolean).join(' '),
}));

describe('SettlementSkeleton', () => {
  it('renders a single skeleton card', () => {
    render(<SettlementSkeleton className="" />);
    
    // Check if skeleton elements are in the document
    const skeletonElements = screen.getAllByRole('status');
    expect(skeletonElements.length).toBeGreaterThan(0);
    
    // Check specific structure
    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
  });
  
  it('renders skeleton group with multiple skeleton cards', () => {
    render(<SettlementSkeletonGroup className="" />);
    
    // Check if multiple skeleton cards are rendered
    const skeletonCards = screen.getAllByTestId('card');
    expect(skeletonCards.length).toBe(2);
    
    // Check if skeleton elements are in each card
    const skeletonElements = screen.getAllByRole('status');
    expect(skeletonElements.length).toBeGreaterThan(2);
  });
});
