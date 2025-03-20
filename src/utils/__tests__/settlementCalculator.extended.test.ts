import { describe, expect, it } from '@jest/globals';
import { calculateSettlement } from '../settlementCalculator';

describe('Settlement Calculator Extended Tests', () => {
  const users = [
    { id: 'user1', email: 'alice@test.com', name: 'Alice' },
    { id: 'user2', email: 'bob@test.com', name: 'Bob' }
  ];

  it('should handle multiple equal split expenses correctly', () => {
    const expenses = [
      {
        id: 'exp1',
        amount: 50,
        date: '2025-03-20',
        paid_by: 'user1',
        split_type: 'Equal',
        paid_by_user: users[0]
      },
      {
        id: 'exp2',
        amount: 30,
        date: '2025-03-21',
        paid_by: 'user1',
        split_type: 'Equal',
        paid_by_user: users[0]
      },
      {
        id: 'exp3',
        amount: 20,
        date: '2025-03-22',
        paid_by: 'user2',
        split_type: 'Equal',
        paid_by_user: users[1]
      },
    ];

    const settlement = calculateSettlement(expenses, users);
    expect(settlement).toEqual({
      from: 'Bob',
      to: 'Alice',
      amount: 30 // Alice paid 80, Bob paid 20, split equally means 50 each, so Bob owes 30
    });
  });

  it('should handle multiple no-split expenses correctly', () => {
    const expenses = [
      {
        id: 'exp1',
        amount: 40,
        date: '2025-03-20',
        paid_by: 'user1',
        split_type: 'NoSplit',
        paid_by_user: users[0]
      },
      {
        id: 'exp2',
        amount: 25,
        date: '2025-03-21',
        paid_by: 'user1',
        split_type: 'NoSplit',
        paid_by_user: users[0]
      },
      {
        id: 'exp3',
        amount: 30,
        date: '2025-03-22',
        paid_by: 'user2',
        split_type: 'NoSplit',
        paid_by_user: users[1]
      },
    ];

    const settlement = calculateSettlement(expenses, users);
    expect(settlement).toEqual({
      from: 'Bob',
      to: 'Alice',
      amount: 35 // Alice paid 65 in no-split expenses, Bob paid 30
    });
  });

  it('should handle complex mixed expense types correctly', () => {
    const expenses = [
      // Equal split expenses
      {
        id: 'exp1',
        amount: 100,
        date: '2025-03-20',
        paid_by: 'user1',
        split_type: 'Equal',
        paid_by_user: users[0]
      },
      {
        id: 'exp2',
        amount: 60,
        date: '2025-03-21',
        paid_by: 'user2',
        split_type: 'Equal',
        paid_by_user: users[1]
      },
      // No-split expenses
      {
        id: 'exp3',
        amount: 40,
        date: '2025-03-22',
        paid_by: 'user1',
        split_type: 'NoSplit',
        paid_by_user: users[0]
      },
      {
        id: 'exp4',
        amount: 70,
        date: '2025-03-23',
        paid_by: 'user2',
        split_type: 'NoSplit',
        paid_by_user: users[1]
      },
    ];

    const settlement = calculateSettlement(expenses, users);
    
    // Equal split: Alice paid 100, Bob paid 60, total 160, so 80 each
    // Alice should receive 20 from Bob for equal split
    // No-split: Alice paid 40, Bob paid 70
    // Alice should pay Bob 30 for no-split
    // Net: Bob owes Alice 20 - 30 = -10, so Alice owes Bob 10
    
    expect(settlement).toEqual({
      from: 'Alice',
      to: 'Bob',
      amount: 10
    });
  });

  it('should handle very small amounts correctly', () => {
    const expenses = [
      {
        id: 'exp1',
        amount: 0.25,
        date: '2025-03-20',
        paid_by: 'user1',
        split_type: 'Equal',
        paid_by_user: users[0]
      },
      {
        id: 'exp2',
        amount: 0.10,
        date: '2025-03-21',
        paid_by: 'user2',
        split_type: 'Equal',
        paid_by_user: users[1]
      },
    ];

    const settlement = calculateSettlement(expenses, users);
    expect(settlement).toEqual({
      from: 'Bob',
      to: 'Alice',
      amount: 0.08 // Alice paid 0.25, Bob paid 0.10, total 0.35, each owes 0.175 (rounded to 2 decimal places)
    });
  });

  it('should handle different split type formats correctly', () => {
    const expenses = [
      {
        id: 'exp1',
        amount: 100,
        date: '2025-03-20',
        paid_by: 'user1',
        split_type: 'equal', // lowercase
        paid_by_user: users[0]
      },
      {
        id: 'exp2',
        amount: 60,
        date: '2025-03-21',
        paid_by: 'user2',
        split_type: 'No Split', // space format
        paid_by_user: users[1]
      },
    ];

    const settlement = calculateSettlement(expenses, users);
    
    // Alice paid 100 equal split (50 each), Alice is owed 50
    // Bob paid 60 no-split, Alice owes 60
    // Net: Alice owes 10
    
    expect(settlement).toEqual({
      from: 'Alice',
      to: 'Bob',
      amount: 10
    });
  });

  it('should handle perfect balance with no settlement needed', () => {
    const expenses = [
      {
        id: 'exp1',
        amount: 50,
        date: '2025-03-20',
        paid_by: 'user1',
        split_type: 'Equal',
        paid_by_user: users[0]
      },
      {
        id: 'exp2',
        amount: 50,
        date: '2025-03-21',
        paid_by: 'user2',
        split_type: 'Equal',
        paid_by_user: users[1]
      },
    ];

    const settlement = calculateSettlement(expenses, users);
    expect(settlement).toEqual({
      from: 'Bob', // Default values when no settlement needed
      to: 'Alice',
      amount: 0
    });
  });
});
