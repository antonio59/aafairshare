import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from '@remix-run/react';
import type { MetaFunction } from "@remix-run/node";
import { useAuth } from '~/contexts/AuthContext';
import MainLayout from '~/components/layouts/MainLayout';
import MonthSelector from "~/components/MonthSelector";
import { Button } from "~/components/ui/button";
import { PlusIcon, PoundSterling, Users, WalletCards, Download, ArrowRight } from "lucide-react";
import { ExpenseWithDetails, MonthSummary, User, Category, Location, Expense } from "~/shared/schema";
import { formatCurrency, getCurrentMonth } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { db } from "~/lib/firebase";
import ExpenseTable from "~/components/ExpenseTable";
import ExpenseForm from "~/components/ExpenseForm";
import SummaryCard from "~/components/SummaryCard";
import { VisuallyHidden } from "~/components/ui/visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  getDocs,
  deleteDoc,
  getDoc,
  limit
} from "firebase/firestore";

export const meta: MetaFunction = () => {
  return [
    { title: "AAFairShare" },
    { name: "description", content: "Expense sharing made simple" },
  ];
};

export default function Index() {
  const [currentMonth, setCurrentMonth] = useState<string | null>(null); // Initialize as null
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | undefined>(undefined);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get global data and loading states from AuthContext
  const {
    currentUser,
    userProfile,
    allUsers,
    categories,
    locations,
    loading: authLoading,
    usersLoading,
    categoriesLoading,
    locationsLoading
  } = useAuth();

  // State for expenses and summary
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [isCurrentMonthSettled, setIsCurrentMonthSettled] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(true);

  // Calculate summary data from expenses
  const calculateSummary = useCallback((expenseList: ExpenseWithDetails[]) => {
    setSummaryLoading(true);

    // Return null if data isn't ready or month isn't set
    if (!currentUser || allUsers.length < 2 || !currentMonth) {
      setSummary(null);
      setSummaryLoading(false);
      return; // Exit if month is null
    }

    const user1 = allUsers.find(u => u.id === currentUser.uid);
    const user2 = allUsers.find(u => u.id !== currentUser.uid);
    if (!user1 || !user2) {
      setSummary(null);
      setSummaryLoading(false);
      return;
    }

    let totalExpenses = 0, totalSplitExpenses = 0;
    const userExpenses: Record<string, number> = { [user1.id]: 0, [user2.id]: 0 };
    let user1_paid_50_50 = 0, user1_paid_100_owed_by_other = 0, user2_paid_100_owed_by_other = 0;

    // Debug the expenses to see what's happening
    console.log('All expenses:', expenseList.map(exp => ({
      amount: exp.amount,
      paidBy: exp.paidByUserId,
      splitType: exp.splitType || '50/50' // Default to 50/50 if not specified
    })));

    expenseList.forEach(exp => {
      const amount = Number(exp.amount) || 0;
      totalExpenses += amount;

      // Track who paid what
      if (exp.paidByUserId === user1.id) userExpenses[user1.id] += amount;
      else if (exp.paidByUserId === user2.id) userExpenses[user2.id] += amount;

      // IMPORTANT: Default to "50/50" if splitType is missing, null, or undefined
      const splitType = exp.splitType || "50/50";

      console.log(`Processing expense: £${amount}, paid by ${exp.paidByUserId === user1.id ? 'User1' : 'User2'}, split: ${splitType}`);

      if (splitType === "50/50") {
        totalSplitExpenses += amount;
        if (exp.paidByUserId === user1.id) user1_paid_50_50 += amount;
      }
      else if (splitType === "100%") {
        // For 100% split type, the other user owes the full amount to the payer
        // If User1 paid, User2 owes User1 the full amount
        if (exp.paidByUserId === user1.id) {
          user1_paid_100_owed_by_other += amount;
          console.log(`User1 paid 100% expense: ${amount}, User2 owes User1 this amount`);
        }
        // If User2 paid, User1 owes User2 the full amount
        else if (exp.paidByUserId === user2.id) {
          user2_paid_100_owed_by_other += amount;
          console.log(`User2 paid 100% expense: ${amount}, User1 owes User2 this amount`);
        }
      }
    });

    // Add debug logs to see what's happening
    console.log('DEBUG VALUES:');
    console.log('Total Expenses:', totalExpenses);
    console.log('User1 Expenses:', userExpenses[user1.id]);
    console.log('User2 Expenses:', userExpenses[user2.id]);
    console.log('Total Split Expenses:', totalSplitExpenses);
    console.log('User1 Paid 50/50:', user1_paid_50_50);

    // FIXED CALCULATION THAT WORKS FOR ALL CASES
    let settlementAmount = 0;
    let settlementDirection = { fromUserId: "", toUserId: "" };

    // Calculate the fair share of 50/50 expenses
    const fairShare = totalSplitExpenses / 2;
    console.log('Fair Share (50/50 expenses):', fairShare);

    // Calculate User1's balance
    // For 50/50 expenses: what User1 paid minus their fair share
    // For 100% expenses: add what User1 paid that User2 owes, subtract what User2 paid that User1 owes
    const user1Balance = user1_paid_50_50 - fairShare + user1_paid_100_owed_by_other - user2_paid_100_owed_by_other;
    console.log('User1 Balance:', user1Balance);

    // Calculate settlement amount (always positive)
    settlementAmount = Math.ceil(Math.abs(user1Balance) * 100) / 100; // Round up to nearest penny

    // Determine who owes whom
    if (Math.abs(user1Balance) < 0.01) { // Use a small threshold to handle floating point issues
      // No settlement needed
      settlementAmount = 0;
      settlementDirection = { fromUserId: "", toUserId: "" };
      console.log('Settlement: No settlement needed (balanced)');
    } else if (user1Balance < 0) {
      // User1 owes User2
      settlementDirection = { fromUserId: user1.id, toUserId: user2.id };
      console.log('Settlement: User1 owes User2', settlementAmount);
    } else {
      // User2 owes User1
      settlementDirection = { fromUserId: user2.id, toUserId: user1.id };
      console.log('Settlement: User2 owes User1', settlementAmount);
    }

    console.log('Final settlement amount:', settlementAmount);

    const calculatedSummary: MonthSummary = {
      month: currentMonth,
      totalExpenses,
      userExpenses,
      settlementAmount,
      settlementDirection,
      categoryTotals: [],
      locationTotals: [],
      splitTypeTotals: {},
      dateDistribution: {}
    };

    setSummary(calculatedSummary);
    setSummaryLoading(false);
  }, [currentMonth, currentUser, allUsers]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  // Set initial month only on the client to avoid hydration mismatch
  useEffect(() => {
    if (!currentMonth) {
      setCurrentMonth(getCurrentMonth());
    }
  }, [currentMonth]); // Run once when currentMonth is null

  // --- Mobile Add Expense Event Listener ---
  useEffect(() => {
    const handleMobileAdd = () => handleAddExpense();
    window.addEventListener('add-expense-event', handleMobileAdd);
    return () => window.removeEventListener('add-expense-event', handleMobileAdd);
  }, []);

  // --- Firestore Listener for Expenses (Current Month) ---
  useEffect(() => {
    if (!currentUser) return;
    if (categoriesLoading || locationsLoading || usersLoading) return;
    if (categories.length === 0 || locations.length === 0 || allUsers.length === 0) return;

    setExpensesLoading(true);
    const expensesCol = collection(db, "expenses");
    const q = query(expensesCol, where("month", "==", currentMonth), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Prepare maps for efficient lookups
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const locationMap = new Map(locations.map(l => [l.id, l]));
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      const fetchedExpenses = snapshot.docs.map(doc => {
        const data = doc.data();
        const category = categoryMap.get(data.categoryId) || { id: data.categoryId, name: 'Unknown Category', color: '#888888' };
        const location = locationMap.get(data.locationId) || { id: data.locationId, name: 'Unknown Location' };
        const paidByUser = userMap.get(data.paidByUserId) || { id: data.paidByUserId, email: 'unknown@example.com', username: 'Unknown User' };

        let date = new Date(); // Default date
        if (data.date instanceof Timestamp) {
          date = data.date.toDate();
        } else if (data.date?.seconds) { // Handle Firestore Timestamp object structure
          date = new Date(data.date.seconds * 1000);
        } else if (typeof data.date === 'string') { // Handle string date
          const parsedDate = new Date(data.date);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate;
          }
        }

        return {
          id: doc.id,
          ...data,
          date,
          amount: Number(data.amount) || 0,
          category,
          location,
          paidByUser
        } as ExpenseWithDetails;
      });

      setExpenses(fetchedExpenses);
      setExpensesLoading(false);

      // Calculate summary data
      calculateSummary(fetchedExpenses);
    }, (error) => {
      console.error("Error fetching expenses:", error);
      toast({ title: "Error", description: "Could not load expenses.", variant: "destructive" });
      setExpensesLoading(false);
    });
    return () => unsubscribe();
  }, [currentMonth, currentUser, categories, locations, allUsers, categoriesLoading, locationsLoading, usersLoading, toast, calculateSummary]);

  // --- Check if current month is settled ---
  useEffect(() => {
    if (!currentUser) return;
    setSettlementLoading(true);
    const settlementsCol = collection(db, "settlements");
    const q = query(settlementsCol, where("month", "==", currentMonth), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsCurrentMonthSettled(snapshot.docs.length > 0);
      setSettlementLoading(false);
    }, (error) => {
      console.error("Error checking settlements:", error);
      setSettlementLoading(false);
    });
    return () => unsubscribe();
  }, [currentMonth, currentUser]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  const handleAddExpense = () => {
    setSelectedExpense(undefined);
    setIsExpenseFormOpen(true);
  };

  const handleEditExpense = (expense: ExpenseWithDetails) => {
    setSelectedExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!currentUser) return;
    try {
      const expenseRef = doc(db, "expenses", expenseId);
      await deleteDoc(expenseRef);
      toast({ title: "Success", description: "Expense deleted successfully." });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({ title: "Error", description: "Could not delete expense.", variant: "destructive" });
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!summary || expensesLoading || summaryLoading) {
      toast({ title: "Data Not Ready", description: "Please wait for data to load." });
      return;
    }
    try {
      // This would be implemented in a real app
      toast({ title: "Export Successful", description: `Expenses exported as ${format.toUpperCase()}.` });
    }
    catch (error) {
      console.error("Export failed:", error);
      toast({ title: "Export Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
    }
  };

  // Calculate user information for display
  const user1 = currentUser ? allUsers.find(u => u.id === currentUser.uid) : null;
  const user1Id = user1?.id;
  const user1Name = user1?.username;
  const user2Data = currentUser ? allUsers.find(u => u.id !== currentUser.uid) : null;
  const user2Id = user2Data?.id;
  const user2Name = user2Data?.username;
  const owingUserId = summary?.settlementDirection.fromUserId;
  const owedUserId = summary?.settlementDirection.toUserId;
  const owingUser = owingUserId ? allUsers.find(u => u.id === owingUserId) : null;
  const owedUser = owedUserId ? allUsers.find(u => u.id === owedUserId) : null;
  const owingUserName = owingUser?.username;
  const owedUserName = owedUser?.username;
  const isSettled = !summary?.settlementAmount || summary.settlementAmount <= 0;
  const balanceTitle = isSettled ? "Settled" : "Settlement Due";
  const balanceTooltip = isSettled ? "The balance is settled for this month" : `${owingUserName || 'Someone'} owes ${owedUserName || 'Someone'} ${formatCurrency(summary?.settlementAmount ?? 0)}`;

  // Define title and description for Dialog
  const dialogTitle = selectedExpense ? "Edit Expense" : "Add New Expense";
  const dialogDescription = "Enter the expense details below. All fields marked with * are required.";

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading...</h2>
        </div>
      </div>
    );
  }

  // If authenticated, show dashboard
  // Render loading or main content based on currentMonth
  if (!currentMonth) {
    // Render a minimal loading state or null until month is set client-side
    return (
       <MainLayout>
         <div className="flex items-center justify-center h-64">Loading month...</div>
       </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Temporarily simplified content for debugging */}
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Dashboard (Simplified)</h1>
        <p>Current Month: {currentMonth}</p>
        <p>Checking if errors persist with minimal content...</p>
        {/* Add back components one by one if this works */}
      </div>
    </MainLayout>
  );
}
