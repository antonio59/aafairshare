import { useState, useCallback, useId, useEffect } from "react"; // Added useEffect
import MonthSelector from "@/components/MonthSelector";
import { ExpenseTable } from "@/components/ExpenseTable";
import ExpenseForm from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
// Removed unused QueryKey import
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Removed unused Settlement, SettlementWithUsers imports
import { Category, Expense, ExpenseWithDetails, Location, MonthSummary, User } from "@shared/schema";
// Removed unused DocumentReference, QueryDocumentSnapshot, DocumentData imports
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCurrentMonth } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { exportExpenses } from "@/lib/exportUtils";
// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// Removed unused apiRequest import
// Removed unused queryClient import
// import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

// Removed unused fetchSettlementsData function
// async function fetchSettlementsData(...) { ... }

// Helper to create a default empty summary object
const createEmptySummary = (month: string): MonthSummary => ({
  month: month,
  totalExpenses: 0,
  userExpenses: {},
  settlementAmount: 0,
  settlementDirection: { fromUserId: '', toUserId: '' },
  categoryTotals: [],
  locationTotals: [],
  splitTypeTotals: {},
  dateDistribution: {}
});


export default function Expenses() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithDetails | undefined>(undefined);
  const { toast } = useToast();
  // Generate unique IDs for accessibility
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const queryClient = useQueryClient(); // Get query client instance

  // --- State for Expenses fetched via useEffect ---
  const [displayedExpenses, setDisplayedExpenses] = useState<ExpenseWithDetails[] | null>(null); // Initialize as null
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  // --- End State ---

  // --- useEffect for fetching expenses ---
  useEffect(() => {
    // Removed isMounted flag
    const fetchExpenses = async () => {
      setIsExpensesLoading(true);
      setDisplayedExpenses(null); // Reset to null on new fetch start

      try {
        const q = query(
          collection(db, "expenses"),
          where("month", "==", currentMonth),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);

        // Removed client-side filter, assuming Firestore query is reliable now.
        const expenseDocs = querySnapshot.docs;

        // Only proceed with mapping if there are docs
        let finalExpenses: ExpenseWithDetails[] = [];
        if (expenseDocs.length > 0) {
            finalExpenses = await Promise.all(
            expenseDocs.map(async expenseDoc => {
              const expenseData = expenseDoc.data() as Expense;
              const userDocRef = doc(db, "users", expenseData.paidByUserId);
              const userDoc = await getDoc(userDocRef);
              const userData = userDoc.exists()
                ? { id: userDoc.id, ...(userDoc.data() as Omit<User, 'id'>) } as User
                : undefined;

              const [categorySnap, locationSnap] = await Promise.all([
                getDoc(doc(db, "categories", expenseData.categoryId)),
                getDoc(doc(db, "locations", expenseData.locationId))
              ]);

              const expenseWithDetails: ExpenseWithDetails = {
                ...expenseData,
                id: expenseDoc.id,
                paidByUser: userData,
                category: categorySnap.exists() ? { id: categorySnap.id, ...(categorySnap.data() as Omit<Category, 'id'>) } : undefined,
                location: locationSnap.exists() ? { id: locationSnap.id, ...(locationSnap.data() as Omit<Location, 'id'>) } : undefined
              };
              return expenseWithDetails;
            })
          );
        }

        setDisplayedExpenses(finalExpenses); // Set the final, filtered, and mapped expenses (could be empty array)

      } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error("Failed to load expenses via useEffect:", error);
        // Type check before accessing properties
        const errorMessage = error instanceof Error ? error.message : "Failed to load expenses data. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        setDisplayedExpenses([]); // Set empty array on error
      } finally {
        setIsExpensesLoading(false);
      }
    };

    fetchExpenses();

    // No cleanup function needed if we don't rely on isMounted
  }, [currentMonth, toast]); // Dependency array includes currentMonth and toast
  // --- End useEffect ---


  const handleMonthChange = (newMonth: string) => {
      setCurrentMonth(newMonth);
      // No explicit cache management needed for summary, key change handles it
    };

  // Fetch Categories (Keep using React Query for potentially static data)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: Infinity,
  });

  // Fetch Locations (Keep using React Query)
  const { data: locations = [], isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "locations"));
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Location[];
      } catch (error) {
        console.error("Failed to load locations:", error);
        toast({
          title: "Error",
          description: "Failed to load locations. Please try again.",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: Infinity,
  });

  // Strictly typed Users query (Keep using React Query)
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("id", "!=", ""));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.warn('No user documents found in Firestore');
          return [];
        }

        const validUsers: User[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (!doc.id || typeof doc.id !== 'string') {
            console.error('Invalid user document ID:', {
              documentId: doc.id,
              isValid: Boolean(doc.id && typeof doc.id === 'string')
            });
            toast({
              title: "Data Error",
              description: `User ${doc.id} has invalid document ID`,
              variant: "destructive"
            });
            throw new Error(`Invalid user document ${doc.id}`);
          }

          const userData: User = {
            id: doc.id,
            username: data.username || 'Unknown',
            email: data.email || '',
            ...data
          };

          validUsers.push(userData);
        });

        return validUsers;
      } catch (error) {
        console.error("Failed to load users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive"
        });
        return [];
      }
    },
    staleTime: 1000 * 60 * 15,
  });

  const handleAddExpense = () => {
    setSelectedExpense(undefined);
    setIsExpenseFormOpen(true);
  };

  const handleEditExpense = (expense: ExpenseWithDetails) => {
    setSelectedExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleCloseExpenseForm = useCallback(() => {
    setIsExpenseFormOpen(false);
    setSelectedExpense(undefined);
    // Manually trigger refetch for summary (expenses handled by useEffect)
    queryClient.refetchQueries({ queryKey: [`summary`, currentMonth], exact: true });
    // No need to refetch expenses query as it's removed
  }, [currentMonth, queryClient]);

  // Fetch summary data for the month (Keep using React Query)
  const {
    data: summary,
    // Removed unused summaryLoading and summaryError
    // isLoading: summaryLoading,
    // isError: summaryError,
  } = useQuery<MonthSummary>({ // Removed explicit context typing
    queryKey: ['summary', currentMonth] as const,
    queryFn: async ({ queryKey }) => { // Keep simple context destructuring
      const [, monthFromKey] = queryKey;

      // Ensure monthFromKey is a valid string before proceeding
      if (typeof monthFromKey !== 'string' || !monthFromKey) {
          console.warn(`Summary query: Invalid monthFromKey detected ('${monthFromKey}'). Returning default empty summary.`);
          // Use currentMonth from component state as a fallback if available and valid, otherwise empty string
          const fallbackMonth = typeof currentMonth === 'string' && currentMonth ? currentMonth : '';
          return createEmptySummary(fallbackMonth);
      }

      try {
        const expensesQuery = query(
          collection(db, "expenses"),
          where("month", "==", monthFromKey)
        );
        const expensesSnapshot = await getDocs(expensesQuery);

        // Filter summary based on fetched data for accuracy
        const filteredSummaryDocs = expensesSnapshot.docs.filter(doc => doc.data().month === monthFromKey);

        // If no matching expenses, return the default empty summary for this month
        if (filteredSummaryDocs.length === 0) {
            return createEmptySummary(monthFromKey);
        }

        const categoryTotals: Record<string, number> = {};
        const userExpenses: Record<string, number> = {};
        let totalExpenses = 0;

        filteredSummaryDocs.forEach(doc => {
          const expense = doc.data() as ExpenseWithDetails;
          totalExpenses += expense.amount;

          if (!categoryTotals[expense.categoryId]) {
            categoryTotals[expense.categoryId] = 0;
          }
          categoryTotals[expense.categoryId] += expense.amount;

          if (!userExpenses[expense.paidByUserId]) {
            userExpenses[expense.paidByUserId] = 0;
          }
          userExpenses[expense.paidByUserId] += expense.amount;
        });

        const calculatedSummary: MonthSummary = {
          month: monthFromKey, // monthFromKey is guaranteed string here
          totalExpenses,
          userExpenses,
          settlementAmount: 0,
          settlementDirection: { fromUserId: '', toUserId: '' },
          categoryTotals: Object.entries(categoryTotals).map(([categoryId, amount]) => ({
            amount,
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
            category: categories.find(c => c.id === categoryId) || { id: categoryId, name: 'Unknown', color: '#999' }
          })),
          locationTotals: [],
          splitTypeTotals: {},
          dateDistribution: {}
        };

        return calculatedSummary;
      } catch (error) {
        console.error("Failed to load summary:", error);
        toast({
          title: "Error",
          description: "Failed to load summary data. Please try again.",
          variant: "destructive"
        });
        // Return default empty summary on error, ensuring month is a string
        return createEmptySummary(monthFromKey || '');
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!currentMonth,
    // Provide initial data matching the empty structure
    initialData: () => createEmptySummary(currentMonth),
  });

  // Removed commented out settlements query

  const handleExport = (format: 'csv' | 'pdf') => {
    // Use displayedExpenses from local state (needs mapping back to ExpenseWithDetails if used)
    const expensesToExport = (displayedExpenses || []).map(exp => {
        const category = categories.find(c => c.id === exp.categoryId);
        const location = locations.find(l => l.id === exp.locationId);
        const paidByUser = users.find(u => u.id === exp.paidByUserId);
        return {
            ...exp,
            category: category || undefined,
            location: location || undefined,
            paidByUser: paidByUser || undefined,
        } as ExpenseWithDetails;
    });
    if (expensesToExport && expensesToExport.length > 0) {
      exportExpenses({
        format,
        month: currentMonth,
        expenses: expensesToExport, // Use mapped data
        settlements: [], // Pass empty array as settlements are commented out
        summary, // Use summary from useQuery
        allUsers: users
      });
    } else {
      toast({
        title: "Export failed",
        description: "No expenses to export for the selected month.",
        variant: "destructive"
      });
    }
  };

  // Map raw expenses to ExpenseWithDetails for the table prop
  const tableExpenses: ExpenseWithDetails[] = (displayedExpenses || []).map(exp => {
      // Find category and location details (assuming categories/locations are loaded)
      const category = categories.find(c => c.id === exp.categoryId);
      const location = locations.find(l => l.id === exp.locationId);
      const paidByUser = users.find(u => u.id === exp.paidByUserId);
      return {
          ...exp,
          category: category || undefined,
          location: location || undefined,
          paidByUser: paidByUser || undefined,
      };
  });


  return (
    <div className="space-y-6 px-2 sm:px-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>

        <Button
          onClick={handleAddExpense}
          className="hidden sm:flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <MonthSelector
        value={currentMonth}
        onChange={handleMonthChange}
        onExport={handleExport}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6 flex flex-col">
        <div className="px-3 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium text-gray-800">Expenses</h3>

            <Button
              onClick={handleAddExpense}
              size="sm"
              variant="outline"
              className="sm:hidden"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto flex-1 min-h-0">
          {/* Conditionally render table or loading state */}
          {isExpensesLoading || displayedExpenses === null ? ( // Check for null as well
             <div className="p-6 text-center">
                <Skeleton className="h-8 w-1/2 mx-auto mb-4" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
             </div>
          ) : (
            <ExpenseTable
              key={currentMonth} // Add key based on month
              expenses={tableExpenses} // Pass the mapped data
              users={users} // Pass the actual users data
              onEdit={handleEditExpense}
              onDelete={(expense) => {
                console.warn("Delete functionality not fully implemented yet for:", expense.id);
                toast({ title: "Delete action", description: `Triggered delete for ${expense.id}`});
              }}
              isLoading={false} // Loading is handled outside now
            />
          )}
        </div>
      </div>

      <Button
        onClick={handleAddExpense}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-6 h-12 w-12 rounded-full bg-primary text-white shadow-lg flex sm:hidden md:flex items-center justify-center hover:bg-blue-600 transition-colors p-0 z-10"
      >
        <PlusIcon className="h-5 w-5" />
      </Button>

      <Dialog open={isExpenseFormOpen} onOpenChange={setIsExpenseFormOpen}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          aria-describedby={dialogDescriptionId}
        >
          <DialogHeader>
            <DialogTitle id={dialogTitleId}>{selectedExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
            <DialogDescription id={dialogDescriptionId}>
              {selectedExpense ? "Update the details of the expense." : "Fill in the details to add a new expense."}
            </DialogDescription>
          </DialogHeader>
          {isExpenseFormOpen && (
            <ExpenseForm
              expense={selectedExpense}
              onClose={handleCloseExpenseForm}
              categories={categories}
              locations={locations}
              users={users}
              isLoading={categoriesLoading || locationsLoading || usersLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
