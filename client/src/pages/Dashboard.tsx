import React, { useState, useEffect, useCallback } from "react";
import MonthSelector from "@/components/MonthSelector";
import SummaryCard from "@/components/SummaryCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import ExpenseForm from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon, PoundSterling, Users, WalletCards, Download, ArrowRight } from "lucide-react"; // Added ArrowRight
import { ExpenseWithDetails, MonthSummary, User, Category, Location, Expense } from "@shared/schema";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext"; // Use the updated AuthContext
import { db } from "@/lib/firebase";
// Import onSnapshot
import { collection, query, where, orderBy, Timestamp, doc, getDocs, deleteDoc, onSnapshot } from "firebase/firestore";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added DropdownMenu imports

type ExportFormat = 'csv' | 'pdf'; // Keep type

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | undefined>(undefined);
  const { toast } = useToast();
  // Get global data and loading states from AuthContext
  const {
    currentUser,
    allUsers,
    categories,
    locations,
    usersLoading,
    categoriesLoading,
    locationsLoading,
    // initialized // REMOVED: Use initialized state
    loading: authLoading // Use the main loading flag
  } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true); // Local loading state for expenses listener
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true); // Local loading state for summary calculation

  // --- Mobile Add Expense Event Listener (Keep as is) ---
  useEffect(() => {
    const handleMobileAdd = () => handleAddExpense();
    window.addEventListener('add-expense-event', handleMobileAdd);
    return () => window.removeEventListener('add-expense-event', handleMobileAdd);
    // No dependencies needed as handleAddExpense is stable
  }, []); // Empty dependency array is correct here

  // --- Real-time Expenses Listener ---
  useEffect(() => {
    // Ensure auth check is complete, user is logged in, and global data is ready
    if (authLoading || !currentUser || usersLoading || categoriesLoading || locationsLoading) {
      setExpensesLoading(true); // Keep loading if context isn't ready
      return;
    }

    setExpensesLoading(true); // Start loading for this specific month query

    const expensesCol = collection(db, "expenses");
    const expensesQuery = query(expensesCol, where("month", "==", currentMonth));

    // Set up the real-time listener
    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      // Pre-build maps for efficient lookups inside the map function
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const locationMap = new Map(locations.map(l => [l.id, l]));
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      const resolvedExpenses = snapshot.docs.map((expenseDoc): ExpenseWithDetails => {
        const expenseData = expenseDoc.data();
        // Use maps for lookups, provide defaults
        const category = categoryMap.get(expenseData.categoryId) || { id: expenseData.categoryId, name: 'Unknown Category', color: '#888888' };
        const location = locationMap.get(expenseData.locationId) || { id: expenseData.locationId, name: 'Unknown Location' };
        const paidByUser = userMap.get(expenseData.paidByUserId) || { id: expenseData.paidByUserId, email: 'unknown@example.com', username: 'Unknown User' };

        // Handle date conversion robustly
        let date = new Date(); // Default to now if date is invalid/missing
        if (expenseData.date instanceof Timestamp) {
          date = expenseData.date.toDate();
        } else if (expenseData.date?.seconds) {
          // Handle potential Firestore GeoPoint or other object with seconds/nanoseconds
          date = new Date(expenseData.date.seconds * 1000);
        } else if (typeof expenseData.date === 'string') {
           // Attempt to parse if it's a string (less ideal)
           const parsedDate = new Date(expenseData.date);
           if (!isNaN(parsedDate.getTime())) {
               date = parsedDate;
           }
        }

        const expenseBase: Expense = {
          id: expenseDoc.id,
          description: expenseData.description || "",
          amount: Number(expenseData.amount) || 0,
          date: date,
          paidByUserId: expenseData.paidByUserId,
          splitType: expenseData.splitType || "50/50",
          categoryId: expenseData.categoryId,
          locationId: expenseData.locationId,
          month: expenseData.month // Ensure month is included
        };
        return { ...expenseBase, category, location, paidByUser };
      });

      // Sort expenses after resolving details
      resolvedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
      setExpenses(resolvedExpenses);
      setExpensesLoading(false); // Loading finished for this snapshot

    }, (error) => {
      console.error("Error fetching expenses snapshot:", error);
      toast({ title: "Error", description: "Failed to load real-time expenses.", variant: "destructive" });
      setExpenses([]); // Clear expenses on error
      setExpensesLoading(false); // Stop loading on error
    });

    // Cleanup function to unsubscribe the listener when the component unmounts or dependencies change
    return () => unsubscribe();

  }, [currentMonth, currentUser, authLoading, allUsers, categories, locations, usersLoading, categoriesLoading, locationsLoading, toast]); // Dependencies for the listener, replaced initialized with authLoading


  // --- Calculate Summary ---
  useEffect(() => {
    // Wait for expenses and user data (from context) to be ready
    // Use the local expensesLoading state and context's usersLoading state
    if (expensesLoading || usersLoading || !currentUser || allUsers.length < 2) {
      setSummaryLoading(true);
      return;
    }
    setSummaryLoading(true); // Start summary calculation

    const user1 = allUsers.find(u => u.id === currentUser.uid);
    const user2 = allUsers.find(u => u.id !== currentUser.uid);

    if (!user1 || !user2) {
      setSummaryLoading(false);
      setSummary(null);
      return; // Exit if users aren't found
    }

    let totalExpenses = 0;
    let totalSplitExpenses = 0;
    const userExpenses: Record<string, number> = { [user1.id]: 0, [user2.id]: 0 };
    let user1_paid_50_50 = 0;
    let user1_paid_100_owed_by_other = 0;
    let user2_paid_100_owed_by_other = 0;

    expenses.forEach(exp => {
      const amount = Number(exp.amount) || 0;
      totalExpenses += amount;
      if (exp.paidByUserId === user1.id) userExpenses[user1.id] += amount;
      else if (exp.paidByUserId === user2.id) userExpenses[user2.id] += amount;

      if (exp.splitType === "50/50") {
        totalSplitExpenses += amount;
        if (exp.paidByUserId === user1.id) user1_paid_50_50 += amount;
      } else if (exp.splitType === "100%") {
        if (exp.paidByUserId === user1.id) user1_paid_100_owed_by_other += amount;
        else if (exp.paidByUserId === user2.id) user2_paid_100_owed_by_other += amount;
      }
    });

    const fairShare = totalSplitExpenses / 2;
    let user1Balance = user1_paid_50_50 - fairShare + user1_paid_100_owed_by_other - user2_paid_100_owed_by_other;
    let settlementAmount = Math.abs(user1Balance);
    let settlementDirection = { fromUserId: "", toUserId: "" };

    if (user1Balance < 0) settlementDirection = { fromUserId: user1.id, toUserId: user2.id };
    else if (user1Balance > 0) settlementDirection = { fromUserId: user2.id, toUserId: user1.id };

    const calculatedSummary: MonthSummary = {
      month: currentMonth,
      totalExpenses,
      userExpenses,
      settlementAmount,
      settlementDirection,
      categoryTotals: [], locationTotals: [], splitTypeTotals: {}, dateDistribution: {},
    };
    setSummary(calculatedSummary);
    setSummaryLoading(false);
  }, [expenses, allUsers, currentUser, expensesLoading, usersLoading, currentMonth]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Handlers for form (Keep as is)
   const handleAddExpense = () => {
     setSelectedExpense(undefined);
     setIsExpenseFormOpen(true);
   };
   const handleEditExpense = (expense: ExpenseWithDetails) => {
     setSelectedExpense(expense);
     setIsExpenseFormOpen(true);
   };
   const onExpenseFormClose = (needsRefetch?: boolean) => {
       setIsExpenseFormOpen(false);
       // No need to manually refetch, onSnapshot handles updates
       // if (needsRefetch) {
       //     // fetchExpensesAndSettlements(currentMonth); // Removed
       // }
    };

   // Updated handleExport to accept format explicitly
   const handleExport = async (format: ExportFormat) => {
     if (!summary || expensesLoading || summaryLoading) {
       toast({ title: "Data Not Ready", description: "Please wait for data to load." });
       return;
     }
     try {
       const { exportExpenses } = await import('@/lib/exportUtils');
       exportExpenses({ format, month: currentMonth, expenses, summary, allUsers });
       toast({ title: "Export Successful", description: `Expenses exported as ${format.toUpperCase()}.` });
     } catch (error) {
       console.error("Export failed:", error);
       toast({ title: "Export Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" });
    }
  };

  // Delete handler (Keep as is)
  const handleDeleteExpense = async (expense: ExpenseWithDetails) => {
    if (!currentUser) return;
    try {
      const expenseRef = doc(db, "expenses", expense.id);
      await deleteDoc(expenseRef);
       toast({ title: "Success", description: "Expense deleted successfully." });
       // No need to manually refetch, onSnapshot handles updates
       // await fetchExpensesAndSettlements(currentMonth); // Removed
     } catch (error) {
       console.error("Error deleting expense:", error);
      toast({ title: "Error", description: "Could not delete expense.", variant: "destructive" });
    }
  };

  // User IDs and names for summary cards
   // --- User Name Logic (Simplified - relies on username being present) ---
   const user1 = currentUser ? allUsers.find(u => u.id === currentUser.uid) : null;
   const user1Id = user1?.id; // Use optional chaining
   const user1Name = user1?.username; // Directly use username

   const user2Data = currentUser ? allUsers.find(u => u.id !== currentUser.uid) : null;
   const user2Id = user2Data?.id;
   const user2Name = user2Data?.username;

   const owingUserId = summary?.settlementDirection.fromUserId;
   const owedUserId = summary?.settlementDirection.toUserId;
   const owingUser = owingUserId ? allUsers.find(u => u.id === owingUserId) : null;
   const owedUser = owedUserId ? allUsers.find(u => u.id === owedUserId) : null;
   const owingUserName = owingUser?.username; // Directly use username
   const owedUserName = owedUser?.username; // Directly use username

   // --- Balance Card Logic (Simplified Title) ---
   const isSettled = !summary?.settlementAmount || summary.settlementAmount <= 0;
   const balanceTitle = isSettled ? "Settled" : "Settlement Due";
   const balanceTooltip = isSettled
     ? "The balance is settled for this month"
     : `${owingUserName || 'Someone'} owes ${owedUserName || 'Someone'} ${formatCurrency(summary?.settlementAmount ?? 0)}`;

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section - Updated Structure */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>

          {/* Row for Month Selector and Buttons - Adjusted for mobile */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"> {/* Changed to flex-col on mobile */}
            <div className="flex-grow w-full md:w-auto"> {/* Ensure month selector takes full width on mobile */}
               <MonthSelector value={currentMonth} onChange={handleMonthChange} />
            </div>

            {/* Buttons - Align to end on mobile and desktop */}
            <div className="flex items-center justify-end gap-3 flex-shrink-0"> {/* Changed justify-start back to justify-end */}
               {/* Export Button with Dropdown */}
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline" // Changed variant
                    size="icon"
                    className="rounded-full w-9 h-9" // Removed custom background/text colors
                  >
                    <Download className="h-4 w-4" /> {/* Adjusted icon size slightly */}
                    <span className="sr-only">Export Options</span>
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuItem onClick={() => handleExport('csv')}>
                     Export as CSV
                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleExport('pdf')}>
                     Export as PDF
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>

                {/* Add Expense Button */}
                <Button
                  onClick={handleAddExpense}
                  variant="default" // Kept default variant
                  size="icon"
                  className="rounded-full w-9 h-9" // Removed custom background/text colors
                >
                  <PlusIcon className="h-4 w-4" /> {/* Adjusted icon size slightly */}
                  <span className="sr-only">Add Expense</span>
               </Button>
            </div>
          </div>
        </div>
        {/* End of Header Section */}


        {/* Summary Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <SummaryCard
              title="Total"
              value={formatCurrency(summary?.totalExpenses || 0)}
              icon={PoundSterling}
              variant="total"
              isLoading={summaryLoading}
            />
          </div>
          <div>
            <SummaryCard
              title={`${user1Name || 'User 1'} Paid`} // Added fallback for name display
              // Ensure user1Id is valid before indexing
              value={formatCurrency(user1Id ? summary?.userExpenses?.[user1Id] || 0 : 0)}
              icon={Users}
              variant="user1"
             isLoading={summaryLoading}
             tooltip={user1Name ? `Amount paid by ${user1Name}` : 'Amount paid by User 1'} // Adjusted tooltip
             photoURL={user1?.photoURL || undefined} // Use user1 object
             email={user1?.email || undefined} // Use user1 object
            />
          </div>
          <div>
            <SummaryCard
              title={`${user2Name || 'User 2'} Paid`} // Added fallback for name display
              // Ensure user2Id is valid before indexing
              value={formatCurrency(user2Id ? summary?.userExpenses?.[user2Id] || 0 : 0)}
              icon={Users}
              variant="user2"
             isLoading={summaryLoading}
             tooltip={user2Name ? `Amount paid by ${user2Name}` : 'Amount paid by User 2'} // Adjusted tooltip
             photoURL={user2Data?.photoURL || undefined}
             email={user2Data?.email || undefined}
            />
          </div>
          <div>
            <SummaryCard
              title={balanceTitle}
              value={formatCurrency(summary?.settlementAmount ?? 0)}
              icon={WalletCards}
             variant="balance"
             // isNegative prop might need adjustment based on how SummaryCard uses it,
             // but the core logic relies on owingUserId vs user1Id comparison.
             isNegative={owingUserId === user1Id}
             isLoading={summaryLoading}
             tooltip={balanceTooltip}
             // Display icons indicating direction in the card itself if possible/desired
             // This might require changes to SummaryCard component
             // Example: Pass owing/owed user info to SummaryCard
             // owingUser={owingUser}
             // owedUser={owedUser}
             photoURL={owingUser?.photoURL || undefined} // Keep photo of owing user for context
             email={owingUser?.email || undefined}
            />
          </div>
        </div>
        {/* End of Summary Cards Section */}

        {/* Expenses Section */}
        <div>
           <h2 className="text-xl font-semibold mb-4">Expenses</h2>
           <ExpenseTable
             expenses={expenses}
             onEdit={handleEditExpense}
             onDelete={handleDeleteExpense}
             // Pass the combined loading state for the table
             isLoading={expensesLoading || usersLoading || categoriesLoading || locationsLoading}
           />
        </div>
      </div>

      {/* Expense Form Dialog - Pass global data and loading states */}
      <ResponsiveDialog
        open={isExpenseFormOpen}
        onOpenChange={(open) => {
          setIsExpenseFormOpen(open);
          if (!open) onExpenseFormClose(false); // Pass false as refetch is not needed
        }}
        title={selectedExpense ? "Edit Expense" : "Add New Expense"}
        description="Enter the expense details below. All fields marked with * are required."
        className="sm:max-w-[600px]"
      >
        <ExpenseForm
          expense={selectedExpense}
          onClose={onExpenseFormClose} // Pass the updated close handler
          categories={categories} // From context
          locations={locations} // From context
          users={allUsers} // From context
          // Pass the combined loading state for the form's dropdowns etc.
          isLoading={categoriesLoading || locationsLoading || usersLoading}
        />
      </ResponsiveDialog>
    </>
  );
}
