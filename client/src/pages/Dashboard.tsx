import React, { useState, useEffect, useCallback } from "react";
import MonthSelector from "@/components/MonthSelector";
import SummaryCard from "@/components/SummaryCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import ExpenseForm from "@/components/ExpenseForm"; // Import the inline form
import { Button } from "@/components/ui/button";
import { PlusIcon, PoundSterling, Users, WalletCards, Download } from "lucide-react"; // Added Download icon
// Removed unused Settlement import
import { ExpenseWithDetails, MonthSummary, User, Category, Location, Expense } from "@shared/schema";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
// Removed unused Skeleton import
// import { Skeleton } from "@/components/ui/skeleton";
// Removed unused exportExpenses import
// import { exportExpenses } from "@/lib/exportUtils";
// Removed unused Tooltip import
// import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
// Removed unused getDoc import
import { collection, query, where, orderBy, Timestamp, doc, getDocs, deleteDoc } from "firebase/firestore";
// Removed unused Dialog imports
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import Dropdown components

// Define ExportFormat locally to match the one in exportUtils
type ExportFormat = 'csv' | 'pdf';

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false); // State to toggle inline form
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | undefined>(undefined);
  const { toast } = useToast();
  // Removed unused userProfile from useAuth()
  const { currentUser } = useAuth();

  // State for Firestore data
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  // Removed unused settlements state
  // const [settlements, setSettlements] = useState<Settlement[]>([]);
  // Removed unused settlementsLoading state
  // const [settlementsLoading, setSettlementsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  // --- Data Fetching Functions ---
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const usersCol = collection(db, "users");
      const snapshot = await getDocs(usersCol);
      const fetchedUsers = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          // id field matches Firebase UID
          email: data.email,
          username: data.username,
          photoURL: data.photoURL // Add photoURL
        } as User;
      });
      // console.log("Fetched users:", fetchedUsers); // Removed console.log
      setAllUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Could not load user data. Please refresh the page.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setUsersLoading(false);
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const catCol = collection(db, "categories");
      const q = query(catCol, orderBy("name"));
      const snapshot = await getDocs(q);
      const fetchedCategories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({ title: "Error", description: "Could not load categories.", variant: "destructive" });
    } finally {
      setCategoriesLoading(false);
    }
  }, [toast]);

  const fetchLocations = useCallback(async () => {
    setLocationsLoading(true);
    try {
      const locCol = collection(db, "locations");
      const q = query(locCol, orderBy("name"));
      const snapshot = await getDocs(q);
      const fetchedLocations = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Location));
      setLocations(fetchedLocations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast({ title: "Error", description: "Could not load locations.", variant: "destructive" });
    } finally {
      setLocationsLoading(false);
    }
  }, [toast]);

  // --- Mobile Add Expense Event Listener ---
  useEffect(() => {
    const handleMobileAdd = () => handleAddExpense();
    window.addEventListener('add-expense-event', handleMobileAdd);
    return () => window.removeEventListener('add-expense-event', handleMobileAdd);
  }, []); // handleAddExpense is stable due to useState setter

  // Fetch Expenses (Settlements excluded)
  const fetchExpensesAndSettlements = useCallback(async (month: string) => {
    if (!currentUser) return;
    setExpensesLoading(true);

    try {
      // First, ensure we have the necessary reference data
      if (!categories.length) await fetchCategories();
      if (!locations.length) await fetchLocations();
      if (!allUsers.length) await fetchUsers();

      const expensesCol = collection(db, "expenses");

      // Log the month we're querying for
      // console.log("Fetching expenses for month:", month); // Removed console.log

      // Create a simpler query that doesn't require a composite index
      let expensesQuery = query(
        expensesCol,
        where("month", "==", month)
      );

      try {
        let expensesSnapshot = await getDocs(expensesQuery);

        // If no results, check all expenses to debug
        if (expensesSnapshot.empty) {
          // console.log("No expenses found for month. Checking all expenses to debug..."); // Removed console.log
          expensesQuery = query(expensesCol);
          expensesSnapshot = await getDocs(expensesQuery);
          // console.log("Total expenses in collection:", expensesSnapshot.size); // Removed console.log
          if (expensesSnapshot.size > 0) {
            // Log some sample data to see the month format
            // Removed unused sampleDocs variable
            // const sampleDocs = expensesSnapshot.docs.slice(0, 3).map(doc => { ... });
            // console.log("Sample expense documents:", sampleDocs); // Removed console.log
          }
        }

        // console.log(`Found ${expensesSnapshot.size} expenses${expensesSnapshot.size > 0 ? ' for month ' + month : ''}`); // Removed console.log

        // Create maps for lookups
        const categoryMap = new Map(categories.map(c => [c.id, c]));
        const locationMap = new Map(locations.map(l => [l.id, l]));
        const userMap = new Map(allUsers.map(u => [u.id, u]));

        // Process expenses with fallbacks for missing references
        const resolvedExpenses = expensesSnapshot.docs.map((expenseDoc): ExpenseWithDetails => {
          const expenseData = expenseDoc.data();
          // console.log(`Processing expense ${expenseDoc.id}:`, expenseData); // Removed console.log

          // Get category with fallback
          const category = categoryMap.get(expenseData.categoryId) || {
            id: expenseData.categoryId,
            name: 'Unknown Category',
            color: '#888888'
          };

          // Get location with fallback
          const location = locationMap.get(expenseData.locationId) || {
            id: expenseData.locationId,
            name: 'Unknown Location'
          };

          // Get user with fallback
          const paidByUser = userMap.get(expenseData.paidByUserId) || {
            id: expenseData.paidByUserId,
            // id field matches paidByUserId
            email: currentUser.email,
            username: 'Unknown User'
          };

          // Convert Timestamp to Date safely
          let date = new Date();
          if (expenseData.date) {
            if (expenseData.date instanceof Timestamp) {
              date = expenseData.date.toDate();
            } else if (expenseData.date.seconds) {
              date = new Date(expenseData.date.seconds * 1000);
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
            month: expenseData.month
          };

          return { ...expenseBase, category, location, paidByUser };
        });

        // Sort expenses by date after fetching
        resolvedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());

        // --- START FIX: Filter expenses to ONLY the requested month before setting state ---
        const filteredExpensesForMonth = resolvedExpenses.filter(exp => exp.month === month);
        // console.log(`Successfully processed ${resolvedExpenses.length} total expenses, filtered down to ${filteredExpensesForMonth.length} for month ${month}`); // Removed console.log
        setExpenses(filteredExpensesForMonth);
        // --- END FIX ---

        // setSettlements([]); // Removed as state is removed
        // setSettlementsLoading(false); // Removed as state is removed

      } catch (error) {
        console.error("Error fetching expenses:", error);
        if (error instanceof Error) {
          console.error("Detailed error:", {
            message: error.message,
            stack: error.stack
          });
        }
        toast({
          title: "Error",
          description: "Failed to load expenses. Please check the console for details.",
          variant: "destructive"
        });
        setExpenses([]);
        // setSettlements([]); // Removed as state is removed
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
      if (error instanceof Error) {
        console.error("Detailed error:", {
          message: error.message,
          stack: error.stack
        });
      }
      toast({
        title: "Error",
        description: "Failed to load expenses. Please check the console for details.",
        variant: "destructive"
      });
      setExpenses([]);
      // setSettlements([]); // Removed as state is removed
    } finally {
      setExpensesLoading(false);
      // setSettlementsLoading(false); // Removed as state is removed
    }
  }, [currentUser, categories, locations, allUsers, fetchCategories, fetchLocations, fetchUsers, toast]);

  // --- Initial Data Fetch ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchCategories(),
          fetchLocations()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load initial data. Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    loadInitialData();
  }, [fetchUsers, fetchCategories, fetchLocations, toast]);

  // --- Fetch Monthly Data ---
  useEffect(() => {
    if (currentUser) {
      fetchExpensesAndSettlements(currentMonth);
    }
  }, [currentMonth, fetchExpensesAndSettlements, currentUser]);

  // --- Calculate Summary ---
  useEffect(() => {
    if (expensesLoading || usersLoading || !currentUser || allUsers.length < 2) {
      setSummaryLoading(true); return;
    }
    setSummaryLoading(true);

    // Find user1 by matching document ID to Firebase UID
    const user1 = allUsers.find(u => u.id === currentUser.uid);
    if (!user1) {
      console.error("Could not identify current user in users collection. UID:", currentUser.uid);
      toast({
        title: "Error",
        description: "Could not identify your user profile. Please try logging out and back in.",
        variant: "destructive"
      });
      setSummaryLoading(false);
      setSummary(null);
      return;
    }

    // Find the other user
    const user2 = allUsers.find(u => u.id !== currentUser.uid);
    if (!user2) {
      console.error("Could not find second user in users collection");
      toast({
        title: "Error",
        description: "Could not find the other user profile.",
        variant: "destructive"
      });
      setSummaryLoading(false);
      setSummary(null);
      return;
    }

    let totalExpenses = 0; // Still useful for the "Total" card
    let totalSplitExpenses = 0; // For calculating fair share of 50/50 items
    const userExpenses: Record<string, number> = { [user1.id]: 0, [user2.id]: 0 }; // Total paid by each user
    let user1_paid_50_50 = 0;
    // Removed unused user2_paid_50_50
    // let user2_paid_50_50 = 0;
    let user1_paid_100_owed_by_other = 0;
    let user2_paid_100_owed_by_other = 0;

    expenses.forEach(exp => {
      const amount = Number(exp.amount) || 0;
      totalExpenses += amount; // Sum all expenses for the total card

      // Track total paid by each user regardless of split type
      if (exp.paidByUserId === user1.id) userExpenses[user1.id] += amount;
      else if (exp.paidByUserId === user2.id) userExpenses[user2.id] += amount;

      // Handle split types for balance calculation
      if (exp.splitType === "50/50") {
        totalSplitExpenses += amount;
        if (exp.paidByUserId === user1.id) {
          user1_paid_50_50 += amount;
        } else if (exp.paidByUserId === user2.id) {
          // user2_paid_50_50 += amount; // This variable is unused
        }
      } else if (exp.splitType === "100%") {
        if (exp.paidByUserId === user1.id) {
          user1_paid_100_owed_by_other += amount; // User 2 owes User 1 this full amount
        } else if (exp.paidByUserId === user2.id) {
          user2_paid_100_owed_by_other += amount; // User 1 owes User 2 this full amount
        }
      }
      // Add other split types here if necessary in the future
    });

    const fairShare = totalSplitExpenses / 2; // Fair share only applies to 50/50 items

    // Calculate User 1's balance
    // Start with their share of 50/50 expenses
    let user1Balance = user1_paid_50_50 - fairShare;
    // Add amounts User 2 owes User 1 (User 1 paid 100%)
    user1Balance += user1_paid_100_owed_by_other;
    // Subtract amounts User 1 owes User 2 (User 2 paid 100%)
    user1Balance -= user2_paid_100_owed_by_other;


    let settlementAmount = 0;
    let settlementDirection = { fromUserId: "", toUserId: "" };

    if (user1Balance < 0) { // User1 owes User2
      settlementAmount = Math.abs(user1Balance);
      settlementDirection = { fromUserId: user1.id, toUserId: user2.id };
    } else if (user1Balance > 0) { // User2 owes User1
      settlementAmount = user1Balance;
      settlementDirection = { fromUserId: user2.id, toUserId: user1.id };
    }

    // Note: categoryTotals, locationTotals, splitTypeTotals, dateDistribution are not calculated here
    // They are calculated in Analytics.tsx. We only need the basic summary for the dashboard cards.
    const calculatedSummary: MonthSummary = {
      month: currentMonth, // Add month
      totalExpenses,
      userExpenses,
      settlementAmount,
      settlementDirection,
      // Provide empty arrays/objects for unused fields to satisfy the type
      categoryTotals: [],
      locationTotals: [],
      splitTypeTotals: {},
      dateDistribution: {},
    };

    setSummary(calculatedSummary);
    setSummaryLoading(false);
    // Added currentMonth to dependency array
  }, [expenses, allUsers, currentUser, expensesLoading, usersLoading, toast, currentMonth]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Handlers to open/close the inline form
   const handleAddExpense = () => {
     setSelectedExpense(undefined);
     setIsExpenseFormOpen(true); // Show inline form
   };
   const handleEditExpense = (expense: ExpenseWithDetails) => {
     setSelectedExpense(expense);
     setIsExpenseFormOpen(true); // Show inline form
   };
   const onExpenseFormClose = (needsRefetch?: boolean) => {
       setIsExpenseFormOpen(false); // Hide inline form
       if (needsRefetch) {
           fetchExpensesAndSettlements(currentMonth);
       }
    };

   // Update handleExport type signature
   const handleExport = async (format: ExportFormat) => { // Use updated ExportFormat type
     if (!summary || expensesLoading || summaryLoading) {
       toast({
         title: "Data Not Ready",
        description: "Please wait for the data to load before exporting.",
        variant: "default",
       });
       return;
     }
     try {
       // Dynamically import the export function only when needed
       const { exportExpenses } = await import('@/lib/exportUtils');
       exportExpenses({
         format,
         month: currentMonth,
        expenses,
        // settlements, // Removed as it causes a type error and isn't fetched here
        summary,
         allUsers, // Pass the fetched user list
       });
       toast({ title: "Export Successful", description: `Expenses exported as ${format.toUpperCase()}.` });
     } catch (error) {
       console.error("Export failed:", error);
       toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  // Removed unused expenseDialogDescId
  // const expenseDialogDescId = "expense-dialog-description";

  // Removed unused user1Name and user2Name
  // const user1Name = userProfile?.username || currentUser?.email?.split('@')[0] || "User 1";
  const user2Data = currentUser ? allUsers.find(u => u.id !== currentUser.uid) : null;
  // const user2Name = user2Data?.username || user2Data?.email?.split('@')[0] || "User 2";
  const user1Id = currentUser?.uid || "unknown1"; // Use Auth UID
  const user2Id = user2Data?.id || "unknown2"; // Use Firestore ID for user 2

  // Find the user who owes money for the settlement card
  const owingUserId = summary?.settlementDirection.fromUserId;
  const owingUser = owingUserId ? allUsers.find(u => u.id === owingUserId) : null;

  // Removed unused showSummarySkeleton and showExpenseSkeleton
  // const showSummarySkeleton = summaryLoading || usersLoading;
  // const showExpenseSkeleton = expensesLoading || categoriesLoading || locationsLoading || usersLoading;

  const handleDeleteExpense = async (expense: ExpenseWithDetails) => {
    if (!currentUser) return;
    try {
      const expenseRef = doc(db, "expenses", expense.id);
      await deleteDoc(expenseRef);
      toast({ title: "Success", description: "Expense deleted successfully." });
      // Refresh expenses
      await fetchExpensesAndSettlements(currentMonth);
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({ title: "Error", description: "Could not delete expense.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            {/* Replace single button with DropdownMenu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Changed to icon button */}
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" /> {/* Removed margin */}
                  <span className="sr-only">Export</span> {/* Added screen reader text */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* Use onSelect for dropdown items */}
                <DropdownMenuItem onSelect={() => handleExport('csv')}>Export as CSV</DropdownMenuItem>
                {/* <DropdownMenuItem onSelect={() => handleExport('xlsx')}>Export as XLSX</DropdownMenuItem> // Removed XLSX option */}
                <DropdownMenuItem onSelect={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Changed to icon button */}
            <Button onClick={handleAddExpense} variant="outline" size="icon">
              <PlusIcon className="h-4 w-4" /> {/* Removed margin */}
              <span className="sr-only">Add Expense</span> {/* Added screen reader text */}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <MonthSelector value={currentMonth} onChange={handleMonthChange} />
        </div>

        {/* Changed to flex container with horizontal scroll */}
        <div className="flex overflow-x-auto space-x-4 py-2">
          {/* Added min-w and flex-shrink-0 to each card wrapper */}
          <div className="min-w-[180px] flex-shrink-0">
            <SummaryCard
              title="Total"
              value={formatCurrency(summary?.totalExpenses || 0)}
              icon={PoundSterling}
              variant="total"
              isLoading={summaryLoading}
            />
          </div>
          <div className="min-w-[180px] flex-shrink-0">
            <SummaryCard
              title="Antonio +"
              value={formatCurrency(summary?.userExpenses?.[user1Id] || 0)}
              icon={Users}
              variant="user1"
              isLoading={summaryLoading}
              tooltip="Amount paid by Antonio"
              photoURL={currentUser?.photoURL || undefined}
              email={currentUser?.email || undefined}
            />
          </div>
          <div className="min-w-[180px] flex-shrink-0">
            <SummaryCard
              title="Andres +"
              value={formatCurrency(summary?.userExpenses?.[user2Id] || 0)}
              icon={Users}
              variant="user2"
              isLoading={summaryLoading}
              tooltip="Amount paid by Andres"
              photoURL={user2Data?.photoURL || undefined}
              email={user2Data?.email || undefined}
            />
          </div>
          <div className="min-w-[180px] flex-shrink-0">
            <SummaryCard
              title={summary?.settlementDirection.fromUserId === user2Id ? "Andres -" : "Antonio -"}
              value={formatCurrency(summary?.settlementAmount ?? 0)}
              icon={WalletCards}
              variant="balance"
              isNegative={summary?.settlementDirection.fromUserId === user1Id}
              isLoading={summaryLoading}
              tooltip={summary?.settlementDirection.fromUserId === user2Id ? "Amount Andres needs to pay Antonio" : "Amount Antonio needs to pay Andres"}
              photoURL={owingUser?.photoURL || undefined}
              email={owingUser?.email || undefined}
            />
          </div>
        </div>
        {/* End of corrected summary card section */}

        <ExpenseTable
          expenses={expenses}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          isLoading={expensesLoading}
        />
      </div>

      {/* Restore ResponsiveDialog */}
      <ResponsiveDialog
        open={isExpenseFormOpen}
        onOpenChange={(open) => {
          setIsExpenseFormOpen(open);
          if (!open) onExpenseFormClose(false);
        }}
        title={selectedExpense ? "Edit Expense" : "Add New Expense"}
        description="Enter the expense details below. All fields marked with * are required."
        // descriptionId prop removed
        className="sm:max-w-[600px]"
      >
        <ExpenseForm
          expense={selectedExpense}
          onClose={onExpenseFormClose}
          categories={categories}
          locations={locations}
          users={allUsers}
          isLoading={categoriesLoading || locationsLoading || usersLoading}
        />
      </ResponsiveDialog>
    </>
  );
}
