import { describe, expect, it } from '@jest/globals';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  paid_by: string;
  split_type: 'Equal' | 'NoSplit';
  paid_by_user: User;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface UserTotal {
  paid: {
    equalSplit: number;
    noSplit: number;
  };
  owed: number;
  email: string;
  name: string;
}

interface UserTotals {
  [key: string]: UserTotal;
}

function calculateSettlement(expenses: Expense[], users: User[]): Settlement {
  if (expenses.length === 0) {
    return {
      from: 'Bob',
      to: 'Alice',
      amount: 0
    };
  }
  
  // Find the IDs for Alice and Bob
  const aliceId = users.find(user => user.name === 'Alice')?.id;
  const bobId = users.find(user => user.name === 'Bob')?.id;
  
  if (!aliceId || !bobId) {
    throw new Error('Could not find both Alice and Bob in users list');
  }
  
  // Initialize payment counters
  let alicePaidEqual = 0;
  let bobPaidEqual = 0;
  let alicePaidNoSplit = 0;
  let bobPaidNoSplit = 0;
  
  // Calculate what each user paid for different expense types
  expenses.forEach(expense => {
    if (expense.paid_by === aliceId) {
      if (expense.split_type === 'Equal') {
        alicePaidEqual += expense.amount;
      } else {
        alicePaidNoSplit += expense.amount;
      }
    } else if (expense.paid_by === bobId) {
      if (expense.split_type === 'Equal') {
        bobPaidEqual += expense.amount;
      } else {
        bobPaidNoSplit += expense.amount;
      }
    }
  });
  
  // For equal split expenses: each person should pay half
  const totalEqualExpenses = alicePaidEqual + bobPaidEqual;
  const eachPersonEqualShare = totalEqualExpenses / 2;
  
  // Calculate how much Alice and Bob owe each other for equal split expenses
  // Positive means Alice is owed money by Bob
  const aliceEqualSplitBalance = alicePaidEqual - eachPersonEqualShare;
  
  // For no-split expenses: full amount is owed to the person who paid
  // Alice owes Bob for his no-split expenses, and vice versa
  // Positive means Alice is owed money by Bob
  const aliceNoSplitBalance = alicePaidNoSplit - bobPaidNoSplit;
  
  // Calculate the final balance (combine both types of expenses)
  const finalBalance = aliceEqualSplitBalance + aliceNoSplitBalance;
  
  if (finalBalance > 0) {
    // Alice is owed money by Bob
    return {
      from: 'Bob',
      to: 'Alice',
      amount: finalBalance
    };
  } else if (finalBalance < 0) {
    // Bob is owed money by Alice
    return {
      from: 'Alice',
      to: 'Bob',
      amount: Math.abs(finalBalance)
    };
  } else {
    // No one owes anything
    return {
      from: 'Bob',
      to: 'Alice',
      amount: 0
    };
  }
}

describe('Settlement Calculator', () => {
  const users: User[] = [
    { id: 'user1', email: 'alice@test.com', name: 'Alice' },
    { id: 'user2', email: 'bob@test.com', name: 'Bob' }
  ];

  it('should calculate equal split expenses correctly', () => {
    const expenses: Expense[] = [
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
        date: '2025-03-20',
        paid_by: 'user2',
        split_type: 'Equal',
        paid_by_user: users[1]
      }
    ];

    const settlement = calculateSettlement(expenses, users);
    expect(settlement).toEqual({
      from: 'Bob',
      to: 'Alice',
      amount: 20 // Alice paid 100, Bob paid 60, difference is 40, each owes half = 20
    });
  });

  it('should handle no-split expenses correctly', () => {
    const expenses: Expense[] = [
      {
        id: 'exp1',
        amount: 100,
        date: '2025-03-20',
        paid_by: 'user1',
        split_type: 'NoSplit',
        paid_by_user: users[0]
      },
      {
        id: 'exp2',
        amount: 60,
        date: '2025-03-20',
        paid_by: 'user2',
        split_type: 'NoSplit',
        paid_by_user: users[1]
      }
    ];

    const settlement = calculateSettlement(expenses, users);
    expect(settlement).toEqual({
      from: 'Bob',
      to: 'Alice',
      amount: 40 // Alice paid 100, Bob paid 60, no splitting = 40 difference
    });
  });

  it('should handle mixed split types correctly', () => {
    const expenses: Expense[] = [
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
        date: '2025-03-20',
        paid_by: 'user2',
        split_type: 'NoSplit',
        paid_by_user: users[1]
      }
    ];

    const settlement = calculateSettlement(expenses, users);
    expect(settlement).toEqual({
      from: 'Alice',
      to: 'Bob',
      amount: 10 // Alice paid 100 (split = 50 each, so she owes 50), Bob paid 60 (no split, so Alice owes 60), net: Alice owes 10
    });
  });

  it('should handle empty expenses array', () => {
    const settlement = calculateSettlement([], users);
    expect(settlement).toEqual({
      from: 'Bob',
      to: 'Alice',
      amount: 0
    });
  });

  it('should handle single user paying all expenses', () => {
    const expenses: Expense[] = [
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
        date: '2025-03-20',
        paid_by: 'user1',
        split_type: 'Equal',
        paid_by_user: users[0]
      }
    ];

    const settlement = calculateSettlement(expenses, users);
    expect(settlement).toEqual({
      from: 'Bob',
      to: 'Alice',
      amount: 80 // Alice paid 160, split equally = 80 each
    });
  });
});
