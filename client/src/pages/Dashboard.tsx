import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
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
import { collection, query, where, orderBy, Timestamp, doc, getDocs, deleteDoc, getDoc, limit } from "firebase/firestore"; // Added limit
// Removed ResponsiveDialog import
// import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
// Import standard Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger, // Needed if triggered by a button, but here controlled by state
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Added DropdownMenu imports
import { VisuallyHidden } from "@/components/ui/visually-hidden"; // Import VisuallyHidden

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
    loading: authLoading
  } = useAuth();

  // Removed useState for expenses and expensesLoading
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [isCurrentMonthSettled, setIsCurrentMonthSettled] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(true);

  // --- Mobile Add Expense Event Listener ---
  useEffect(() => {
    const handleMobileAdd = () => handleAddExpense();
    window.addEventListener('add-expense-event', handleMobileAdd);
    return () => window.removeEventListener('add-expense-event', handleMobileAdd);
  }, []);

  // --- Fetch Expenses using React Query ---
  const fetchExpenses = useCallback(async (month: string): Promise<ExpenseWithDetails[]> => {
    console.log("Fetching expenses for month:", month);
    const expensesCol = collection(db, "expenses");
    const expensesQuery = query(expensesCol, where("month", "==", month));
    const snapshot = await getDocs(expensesQuery);

    // Prepare maps for efficient lookups (ensure data is loaded)
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const locationMap = new Map(locations.map(l => [l.id, l]));
    const userMap = new Map(allUsers.map(u => [u.id, u]));

    const resolvedExpenses = snapshot.docs.map((expenseDoc): ExpenseWithDetails => {
      const expenseData = expenseDoc.data();
      const category = categoryMap.get(expenseData.categoryId) || { id: expenseData.categoryId, name: 'Unknown Category', color: '#888888' };
      const location = locationMap.get(expenseData.locationId) || { id: expenseData.locationId, name: 'Unknown Location' };
      const paidByUser = userMap.get(expenseData.paidByUserId) || { id: expenseData.paidByUserId, email: 'unknown@example.com', username: 'Unknown User' };

      let date = new Date(); // Default date
      if (expenseData.date instanceof Timestamp) {
        date = expenseData.date.toDate();
      } else if (expenseData.date?.seconds) { // Handle Firestore Timestamp object structure if not instance
        date = new Date(expenseData.date.seconds * 1000);
      } else if (typeof expenseData.date === 'string') { // Handle string date
        const parsedDate = new Date(expenseData.date);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate;
        }
      }
      // Ensure amount is a number
      const amount = Number(expenseData.amount) || 0;

      const expenseBase: Expense = {
        id: expenseDoc.id,
        description: expenseData.description || "",
        amount: amount,
        date: date,
        paidByUserId: expenseData.paidByUserId,
        splitType: expenseData.splitType || "50/50",
        categoryId: expenseData.categoryId,
        locationId: expenseData.locationId,
        month: expenseData.month
      };
      return { ...expenseBase, category, location, paidByUser };
    });

    resolvedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
    console.log("Resolved expenses:", resolvedExpenses.length);
    return resolvedExpenses;
  }, [categories, locations, allUsers]); // Dependencies for the fetch function

  const {
    data: expensesData, // Rename data to avoid conflict
    isLoading: expensesLoading, // Use isLoading from useQuery
    error: expensesError,
  } = useQuery<ExpenseWithDetails[], Error>({
    queryKey: ['expenses', currentMonth], // Query key includes the month
    queryFn: () => fetchExpenses(currentMonth),
    // Enable the query only when all necessary context data is loaded and user is logged in
    enabled: !!currentUser && !authLoading && !usersLoading && !categoriesLoading && !locationsLoading && categories.length > 0 && locations.length > 0 && allUsers.length > 0,
    staleTime: 5 * 60 * 1000, // Optional: Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Optional: Garbage collect after 10 minutes of inactivity
  });

  // Handle query error
  useEffect(() => {
    if (expensesError) {
      console.error("Error fetching expenses query:", expensesError);
      toast({ title: "Error", description: `Failed to load expenses: ${expensesError.message}`, variant: "destructive" });
    }
  }, [expensesError, toast]);

  // Use fetched data or default to empty array
  const expenses = expensesData ?? [];

  // --- Calculate Summary (depends on expenses from useQuery) ---
  useEffect(() => {
    // Depend on expensesLoading from useQuery and other context loadings
    if (expensesLoading || usersLoading || categoriesLoading || locationsLoading || !currentUser || allUsers.length < 2) {
      setSummaryLoading(true);
      return; // Exit if data isn't ready
    }
    setSummaryLoading(true);
    const user1 = allUsers.find(u => u.id === currentUser.uid);
    const user2 = allUsers.find(u => u.id !== currentUser.uid);
    if (!user1 || !user2) { setSummaryLoading(false); setSummary(null); return; }
    let totalExpenses = 0, totalSplitExpenses = 0;
    const userExpenses: Record<string, number> = { [user1.id]: 0, [user2.id]: 0 };
    let user1_paid_50_50 = 0, user1_paid_100_owed_by_other = 0, user2_paid_100_owed_by_other = 0;
    expenses.forEach(exp => {
      const amount = Number(exp.amount) || 0;
      totalExpenses += amount;
      if (exp.paidByUserId === user1.id) userExpenses[user1.id] += amount;
      else if (exp.paidByUserId === user2.id) userExpenses[user2.id] += amount;
      if (exp.splitType === "50/50") { totalSplitExpenses += amount; if (exp.paidByUserId === user1.id) user1_paid_50_50 += amount; }
      else if (exp.splitType === "100%") { if (exp.paidByUserId === user1.id) user1_paid_100_owed_by_other += amount; else if (exp.paidByUserId === user2.id) user2_paid_100_owed_by_other += amount; }
    });
    const fairShare = totalSplitExpenses / 2;
    let user1Balance = user1_paid_50_50 - fairShare + user1_paid_100_owed_by_other - user2_paid_100_owed_by_other;
    let settlementAmount = Math.abs(user1Balance);
    let settlementDirection = { fromUserId: "", toUserId: "" };
    if (user1Balance < 0) settlementDirection = { fromUserId: user1.id, toUserId: user2.id };
    else if (user1Balance > 0) settlementDirection = { fromUserId: user2.id, toUserId: user1.id };
    const calculatedSummary: MonthSummary = { month: currentMonth, totalExpenses, userExpenses, settlementAmount, settlementDirection, categoryTotals: [], locationTotals: [], splitTypeTotals: {}, dateDistribution: {} };
    setSummary(calculatedSummary);
    setSummaryLoading(false);
  // Recalculate when expenses array changes, or users/context data changes
  }, [expenses, allUsers, currentUser, expensesLoading, usersLoading, categoriesLoading, locationsLoading, currentMonth]);

    // --- Fetch Settlement Status ---
    useEffect(() => {
      if (!currentUser) return;
      setSettlementLoading(true);
      const settlementsCol = collection(db, "settlements");
      // Query for any settlement document for the current month
      const q = query(settlementsCol, where("month", "==", currentMonth), limit(1));

      // Use getDocs for a one-time fetch is sufficient here unless we expect real-time changes often
      getDocs(q).then((snapshot) => {
        setIsCurrentMonthSettled(!snapshot.empty); // True if any settlement doc exists
        setSettlementLoading(false);
      }).catch((error) => {
        console.error("Error fetching settlement status:", error);
        toast({ title: "Error", description: "Could not check settlement status.", variant: "destructive" });
        setIsCurrentMonthSettled(false); // Assume not settled on error
        setSettlementLoading(false);
      });

      // If real-time updates are needed, use onSnapshot instead:
      /*
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setIsCurrentMonthSettled(!snapshot.empty);
        setSettlementLoading(false);
      }, (error) => {
        console.error("Error fetching settlement status:", error);
        toast({ title: "Error", description: "Could not check settlement status.", variant: "destructive" });
        setIsCurrentMonthSettled(false); // Assume not settled on error
        setSettlementLoading(false);
      });
      return () => unsubscribe();
      */
    }, [currentMonth, currentUser, toast]);

  const handleMonthChange = (month: string) => { setCurrentMonth(month); };
  const handleAddExpense = () => { setSelectedExpense(undefined); setIsExpenseFormOpen(true); };
  const handleEditExpense = (expense: ExpenseWithDetails) => { setSelectedExpense(expense); setIsExpenseFormOpen(true); };
  const onExpenseFormClose = (needsRefetch?: boolean) => { setIsExpenseFormOpen(false); };
  const handleExport = async (format: ExportFormat) => {
    // Check expensesLoading from useQuery
    if (!summary || expensesLoading || summaryLoading) { toast({ title: "Data Not Ready", description: "Please wait for data to load." }); return; }
    try { const { exportExpenses } = await import('@/lib/exportUtils'); exportExpenses({ format, month: currentMonth, expenses, summary, allUsers }); toast({ title: "Export Successful", description: `Expenses exported as ${format.toUpperCase()}.` }); }
    catch (error) { console.error("Export failed:", error); toast({ title: "Export Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" }); }
  };
  const handleDeleteExpense = async (expense: ExpenseWithDetails) => {
    if (!currentUser) return;
    try {
      const expenseRef = doc(db, "expenses", expense.id);
      await deleteDoc(expenseRef);
      // No need to manually invalidate here if using React Query correctly,
      // but explicit invalidation after delete is also fine.
      // queryClient.invalidateQueries({ queryKey: ['expenses', currentMonth] });
      // queryClient.invalidateQueries({ queryKey: ['summary', currentMonth] }); // Also invalidate summary if needed
      toast({ title: "Success", description: "Expense deleted successfully." });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({ title: "Error", description: "Could not delete expense.", variant: "destructive" });
    }
  };

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

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-grow w-full md:w-auto">
               <MonthSelector value={currentMonth} onChange={handleMonthChange} />
            </div>
            <div className="flex items-center justify-end gap-3 flex-shrink-0">
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full w-9 h-9">
                    <Download className="h-4 w-4" /> <span className="sr-only">Export Options</span>
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuItem onClick={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
                {/* Disable Add Expense button if month is settled */}
                <Button
                  onClick={handleAddExpense}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-9 h-9"
                  disabled={isCurrentMonthSettled || settlementLoading} // Disable if settled or loading status
                  aria-label={isCurrentMonthSettled ? "Cannot add expense to settled month" : "Add Expense"}
                >
                  <PlusIcon className="h-4 w-4" />
                  <VisuallyHidden>{isCurrentMonthSettled ? "Cannot add expense to settled month" : "Add Expense"}</VisuallyHidden>
                </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards - Confirmed grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div> <SummaryCard title="Total" value={formatCurrency(summary?.totalExpenses || 0)} icon={PoundSterling} variant="total" isLoading={summaryLoading} /> </div>
          <div> <SummaryCard title={`${user1Name || 'User 1'} Paid`} value={formatCurrency(user1Id ? summary?.userExpenses?.[user1Id] || 0 : 0)} icon={Users} variant="user1" isLoading={summaryLoading} tooltip={user1Name ? `Amount paid by ${user1Name}` : 'Amount paid by User 1'} photoURL={user1?.photoURL || undefined} email={user1?.email || undefined} /> </div>
          <div> <SummaryCard title={`${user2Name || 'User 2'} Paid`} value={formatCurrency(user2Id ? summary?.userExpenses?.[user2Id] || 0 : 0)} icon={Users} variant="user2" isLoading={summaryLoading} tooltip={user2Name ? `Amount paid by ${user2Name}` : 'Amount paid by User 2'} photoURL={user2Data?.photoURL || undefined} email={user2Data?.email || undefined} /> </div>
          <div> <SummaryCard title={balanceTitle} value={formatCurrency(Math.floor((summary?.settlementAmount ?? 0) * 100) / 100)} icon={WalletCards} variant="balance" isNegative={owingUserId === user1Id} isLoading={summaryLoading} tooltip={balanceTooltip} photoURL={owingUser?.photoURL || undefined} email={owingUser?.email || undefined} /> </div>
        </div>

        {/* Expenses Section */}
        <div>
           <h2 className="text-xl font-semibold mb-4">Expenses</h2>
           {/* Pass expenses from useQuery result */}
           <ExpenseTable
             expenses={expenses}
             onEdit={handleEditExpense}
             onDelete={handleDeleteExpense}
             isLoading={expensesLoading || usersLoading || categoriesLoading || locationsLoading || settlementLoading} // Include settlementLoading
             isMonthSettled={isCurrentMonthSettled} // Pass settlement status
           />
        </div>
      </div>

      {/* Standard Dialog for Expense Form */}
      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent className="sm:max-w-[600px] w-[90vw] max-w-[90vw] rounded-lg p-0 border-gray-200"> {/* Remove padding from content */}
           {/* Add DialogHeader, Title, and Description for Accessibility */}
           <DialogHeader> {/* Removed padding */}
             <DialogTitle>
               <VisuallyHidden>{dialogTitle}</VisuallyHidden> {/* Hide visually */}
             </DialogTitle>
             <DialogDescription>
               <VisuallyHidden>{dialogDescription}</VisuallyHidden> {/* Hide visually */}
             </DialogDescription>
           </DialogHeader>
           {/* Scrollable container for the form */}
          {/* Form container - remove padding here as it's in ExpenseForm */}
          <div className="max-h-[70vh] overflow-y-auto">
            <ExpenseForm
              expense={selectedExpense}
              onClose={onExpenseFormClose} // Pass close handler
              categories={categories}
              locations={locations} // Re-add locations prop
              users={allUsers}
              isLoading={categoriesLoading || locationsLoading || usersLoading}
            />
          </div>
          {/* Footer can be added here if needed, e.g., for explicit Save/Cancel buttons */}
          {/* <DialogFooter> */}
          {/*   <Button type="button" variant="secondary" onClick={() => setIsExpenseFormOpen(false)}>Cancel</Button> */}
          {/*   <Button type="submit" form="expense-form-id">Save</Button> {/* Assuming ExpenseForm has id="expense-form-id" */}
          {/* </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  );
}
