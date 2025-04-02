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

  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // --- Mobile Add Expense Event Listener ---
  useEffect(() => {
    const handleMobileAdd = () => handleAddExpense();
    window.addEventListener('add-expense-event', handleMobileAdd);
    return () => window.removeEventListener('add-expense-event', handleMobileAdd);
  }, []);

  // --- Real-time Expenses Listener ---
  useEffect(() => {
    if (authLoading || !currentUser || usersLoading || categoriesLoading || locationsLoading) {
      setExpensesLoading(true);
      return;
    }
    setExpensesLoading(true);
    const expensesCol = collection(db, "expenses");
    const expensesQuery = query(expensesCol, where("month", "==", currentMonth));
    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const locationMap = new Map(locations.map(l => [l.id, l]));
      const userMap = new Map(allUsers.map(u => [u.id, u]));
      const resolvedExpenses = snapshot.docs.map((expenseDoc): ExpenseWithDetails => {
        const expenseData = expenseDoc.data();
        const category = categoryMap.get(expenseData.categoryId) || { id: expenseData.categoryId, name: 'Unknown Category', color: '#888888' };
        const location = locationMap.get(expenseData.locationId) || { id: expenseData.locationId, name: 'Unknown Location' };
        const paidByUser = userMap.get(expenseData.paidByUserId) || { id: expenseData.paidByUserId, email: 'unknown@example.com', username: 'Unknown User' };
        let date = new Date();
        if (expenseData.date instanceof Timestamp) { date = expenseData.date.toDate(); }
        else if (expenseData.date?.seconds) { date = new Date(expenseData.date.seconds * 1000); }
        else if (typeof expenseData.date === 'string') { const parsedDate = new Date(expenseData.date); if (!isNaN(parsedDate.getTime())) { date = parsedDate; } }
        const expenseBase: Expense = { id: expenseDoc.id, description: expenseData.description || "", amount: Number(expenseData.amount) || 0, date: date, paidByUserId: expenseData.paidByUserId, splitType: expenseData.splitType || "50/50", categoryId: expenseData.categoryId, locationId: expenseData.locationId, month: expenseData.month };
        return { ...expenseBase, category, location, paidByUser };
      });
      resolvedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
      setExpenses(resolvedExpenses);
      setExpensesLoading(false);
    }, (error) => {
      console.error("Error fetching expenses snapshot:", error);
      toast({ title: "Error", description: "Failed to load real-time expenses.", variant: "destructive" });
      setExpenses([]);
      setExpensesLoading(false);
    });
    return () => unsubscribe();
  }, [currentMonth, currentUser, authLoading, allUsers, categories, locations, usersLoading, categoriesLoading, locationsLoading, toast]);

  // --- Calculate Summary ---
  useEffect(() => {
    if (expensesLoading || usersLoading || !currentUser || allUsers.length < 2) {
      setSummaryLoading(true);
      return;
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
  }, [expenses, allUsers, currentUser, expensesLoading, usersLoading, currentMonth]);

  const handleMonthChange = (month: string) => { setCurrentMonth(month); };
  const handleAddExpense = () => { setSelectedExpense(undefined); setIsExpenseFormOpen(true); };
  const handleEditExpense = (expense: ExpenseWithDetails) => { setSelectedExpense(expense); setIsExpenseFormOpen(true); };
  const onExpenseFormClose = (needsRefetch?: boolean) => { setIsExpenseFormOpen(false); };
  const handleExport = async (format: ExportFormat) => {
    if (!summary || expensesLoading || summaryLoading) { toast({ title: "Data Not Ready", description: "Please wait for data to load." }); return; }
    try { const { exportExpenses } = await import('@/lib/exportUtils'); exportExpenses({ format, month: currentMonth, expenses, summary, allUsers }); toast({ title: "Export Successful", description: `Expenses exported as ${format.toUpperCase()}.` }); }
    catch (error) { console.error("Export failed:", error); toast({ title: "Export Failed", description: error instanceof Error ? error.message : "An unknown error occurred.", variant: "destructive" }); }
  };
  const handleDeleteExpense = async (expense: ExpenseWithDetails) => {
    if (!currentUser) return;
    try { const expenseRef = doc(db, "expenses", expense.id); await deleteDoc(expenseRef); toast({ title: "Success", description: "Expense deleted successfully." }); }
    catch (error) { console.error("Error deleting expense:", error); toast({ title: "Error", description: "Could not delete expense.", variant: "destructive" }); }
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
                <Button onClick={handleAddExpense} variant="outline" size="icon" className="rounded-full w-9 h-9">
                  <PlusIcon className="h-4 w-4" /> <span className="sr-only">Add Expense</span>
               </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards - Confirmed grid layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div> <SummaryCard title="Total" value={formatCurrency(summary?.totalExpenses || 0)} icon={PoundSterling} variant="total" isLoading={summaryLoading} /> </div>
          <div> <SummaryCard title={`${user1Name || 'User 1'} Paid`} value={formatCurrency(user1Id ? summary?.userExpenses?.[user1Id] || 0 : 0)} icon={Users} variant="user1" isLoading={summaryLoading} tooltip={user1Name ? `Amount paid by ${user1Name}` : 'Amount paid by User 1'} photoURL={user1?.photoURL || undefined} email={user1?.email || undefined} /> </div>
          <div> <SummaryCard title={`${user2Name || 'User 2'} Paid`} value={formatCurrency(user2Id ? summary?.userExpenses?.[user2Id] || 0 : 0)} icon={Users} variant="user2" isLoading={summaryLoading} tooltip={user2Name ? `Amount paid by ${user2Name}` : 'Amount paid by User 2'} photoURL={user2Data?.photoURL || undefined} email={user2Data?.email || undefined} /> </div>
          <div> <SummaryCard title={balanceTitle} value={formatCurrency(summary?.settlementAmount ?? 0)} icon={WalletCards} variant="balance" isNegative={owingUserId === user1Id} isLoading={summaryLoading} tooltip={balanceTooltip} photoURL={owingUser?.photoURL || undefined} email={owingUser?.email || undefined} /> </div>
        </div>

        {/* Expenses Section */}
        <div>
           <h2 className="text-xl font-semibold mb-4">Expenses</h2>
           <ExpenseTable expenses={expenses} onEdit={handleEditExpense} onDelete={handleDeleteExpense} isLoading={expensesLoading || usersLoading || categoriesLoading || locationsLoading} />
        </div>
      </div>

      {/* Standard Dialog for Expense Form */}
      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent className="sm:max-w-[600px] w-[90vw] max-w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {/* Use VisuallyHidden for accessibility if description is implied */}
              <VisuallyHidden>{dialogDescription}</VisuallyHidden>
              {dialogDescription} {/* Keep visible description */}
            </DialogDescription>
          </DialogHeader>
          {/* Add scrollable container for the form itself */}
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            <ExpenseForm
              expense={selectedExpense}
              onClose={() => onExpenseFormClose(false)} // Close handler
              categories={categories}
              locations={locations}
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
