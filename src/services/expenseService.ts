
import { Expense, MonthData, AnalyticsData } from "../types";

// Mock data based on the screenshots
const users = [
  { id: "1", name: "Antonio", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio" },
  { id: "2", name: "Andres", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andres" }
];

const expenses: Expense[] = [
  {
    id: "1",
    amount: 44.97,
    date: "2025-04-03",
    category: "Groceries",
    location: "Ocado",
    paidBy: "1", // Antonio
    split: "50/50"
  },
  {
    id: "2",
    amount: 179.57,
    date: "2025-04-01",
    category: "Utilities",
    location: "Tower Hamlets Council Tax",
    paidBy: "1", // Antonio
    split: "50/50"
  },
  {
    id: "3",
    amount: 40.00,
    date: "2025-04-01",
    category: "Utilities",
    location: "Thames Water",
    paidBy: "1", // Antonio
    split: "50/50"
  },
  {
    id: "4",
    amount: 25.00,
    date: "2025-04-01",
    category: "Utilities",
    location: "Hyperoptic",
    paidBy: "1", // Antonio
    split: "50/50"
  },
  {
    id: "5",
    amount: 101.41,
    date: "2025-04-01",
    category: "Utilities",
    location: "Ovo Energy",
    paidBy: "1", // Antonio
    split: "50/50"
  }
];

// Mock API functions
export const getMonthData = async (year: number, month: number): Promise<MonthData> => {
  // In a real app, this would fetch from your backend
  // For now, we'll use the mock data
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const fairShare = totalExpenses / 2;
  const user1Paid = expenses.filter(e => e.paidBy === "1").reduce((sum, exp) => sum + exp.amount, 0);
  const user2Paid = expenses.filter(e => e.paidBy === "2").reduce((sum, exp) => sum + exp.amount, 0);
  
  return {
    totalExpenses,
    fairShare,
    settlement: fairShare,
    settlementDirection: 'owes',
    user1Paid,
    user2Paid,
    expenses
  };
};

export const getAnalyticsData = async (year: number, month: number): Promise<AnalyticsData> => {
  // Mock analytics data
  return {
    userComparison: {
      user1Percentage: 100, // Antonio paid everything
      user2Percentage: 0,
    },
    categoryBreakdown: [
      { name: "Utilities", amount: 345.98, percentage: 88 },
      { name: "Groceries", amount: 44.97, percentage: 12 }
    ],
    locationBreakdown: [
      { name: "Tower Hamlets Council Tax", amount: 179.57, percentage: 46 },
      { name: "Ovo Energy", amount: 101.41, percentage: 26 },
      { name: "Ocado", amount: 44.97, percentage: 12 },
      { name: "Thames Water", amount: 40.00, percentage: 10 },
      { name: "Hyperoptic", amount: 25.00, percentage: 6 }
    ],
    trends: [
      { month: "Jan", total: 380, user1: 380, user2: 0 },
      { month: "Feb", total: 420, user1: 400, user2: 20 },
      { month: "Mar", total: 350, user1: 350, user2: 0 },
      { month: "Apr", total: 390.95, user1: 390.95, user2: 0 }
    ]
  };
};

export const addExpense = async (expense: Omit<Expense, "id">): Promise<Expense> => {
  // In a real app, this would send to your backend
  console.log("Adding expense:", expense);
  
  // Return a mock response with a fake ID
  return {
    id: Date.now().toString(),
    ...expense
  };
};

export const getUsers = async (): Promise<typeof users> => {
  return users;
};

// Function to get the current month data for display
export const getCurrentMonthLabel = (): string => {
  const date = new Date();
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const getCurrentMonth = (): number => {
  return new Date().getMonth() + 1; // JavaScript months are 0-indexed
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};
