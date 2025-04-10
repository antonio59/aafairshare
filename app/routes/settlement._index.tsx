import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import MonthSelector from "~/components/MonthSelector";
import SettlementHistory from "~/components/SettlementHistory";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tooltip } from "~/components/ui/tooltip";
import { Check, CalendarClock, X } from "lucide-react";
import { Settlement as SettlementType, User, Expense } from "~/shared/schema";
import { getCurrentMonth, formatCurrency, getPreviousMonth, formatDate, formatMonthYear } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { useIsMobile } from "~/hooks/use-mobile";
import { Skeleton } from "~/components/ui/skeleton";
import { ResponsiveDialog } from "~/components/ui/responsive-dialog";
import { DialogFooter, DialogClose } from "~/components/ui/dialog";
import { useAuth } from "~/contexts/AuthContext";
import { db } from "~/lib/firebase";
import { calculateSettlement } from "~/lib/expense-calculations";
import { sendSettlementEmail } from "~/lib/email";
import MainLayout from "~/components/layouts/MainLayout";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";

// Define a specific type for the summary data needed on this page
interface SettlementPageSummary {
  month: string;
  totalExpenses: number;
  userExpenses: Record<string, number>; // { userId: amount }
}

export const meta: MetaFunction = () => {
  return [
    { title: "Settlement - AAFairShare" },
    { name: "description", content: "Manage expense settlements between users" },
  ];
};

export default function Settlement() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser, loading } = useAuth();
  const isMobile = useIsMobile();

  // State for Firestore data
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [settlements, setSettlements] = useState<SettlementType[]>([]);
  const [settlementsLoading, setSettlementsLoading] = useState(true);
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState<Expense[]>([]);
  const [previousMonthExpensesLoading, setPreviousMonthExpensesLoading] = useState(true);
  const [previousMonthSettlements, setPreviousMonthSettlements] = useState<SettlementType[]>([]);
  const [previousMonthSettlementsLoading, setPreviousMonthSettlementsLoading] = useState(true);

  // State for calculated data
  const [summary, setSummary] = useState<SettlementPageSummary | null>(null);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  // --- Firestore Listener for Users ---
  useEffect(() => {
    if (!currentUser) return;
    setUsersLoading(true);
    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(fetchedUsers);
      setUsersLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Could not load users.", variant: "destructive" });
      setUsersLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser, toast]);

  // --- Firestore Listener for Expenses (Current Month) ---
  useEffect(() => {
    if (!currentUser) return;
    setExpensesLoading(true);
    const expensesCol = collection(db, "expenses");
    const q = query(expensesCol, where("month", "==", currentMonth), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedExpenses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, ...data,
          date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate() : new Date(), // Convert Timestamp
        } as Expense;
      });
      setExpenses(fetchedExpenses);
      setExpensesLoading(false);
    }, (error) => {
      console.error("Error fetching current month expenses:", error);
      toast({ title: "Error", description: "Could not load expenses.", variant: "destructive" });
      setExpensesLoading(false);
    });
    return () => unsubscribe();
  }, [currentMonth, currentUser, toast]);

  // --- Firestore Listener for Settlements (Current Month) ---
   useEffect(() => {
     if (!currentUser) return;
     setSettlementsLoading(true);
     const settlementsCol = collection(db, "settlements");
     const q = query(settlementsCol, where("month", "==", currentMonth));
     const unsubscribe = onSnapshot(q, (snapshot) => {
       const fetchedSettlements = snapshot.docs.map(doc => {
         const data = doc.data();
         return {
           id: doc.id, ...data,
           date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate() : new Date(),
         } as SettlementType;
       });
       setSettlements(fetchedSettlements);
       setSettlementsLoading(false);
     }, (error) => {
       console.error("Error fetching settlements:", error);
       toast({ title: "Error", description: "Could not load settlements.", variant: "destructive" });
       setSettlementsLoading(false);
     });
     return () => unsubscribe();
   }, [currentMonth, currentUser, toast]);

   // --- Firestore Listener for Previous Month Data ---
   const previousMonth = getPreviousMonth(currentMonth);
   useEffect(() => {
     if (!currentUser || !previousMonth) return;

     // Previous Month Settlements
     setPreviousMonthSettlementsLoading(true);
     const prevSettlementsCol = collection(db, "settlements");
     const prevSettlementsQ = query(prevSettlementsCol, where("month", "==", previousMonth));
     const unsubPrevSettlements = onSnapshot(prevSettlementsQ, (snapshot) => {
       const fetched = snapshot.docs.map(doc => {
         const data = doc.data();
         return {
           id: doc.id,
           ...data,
           date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate() : new Date(), // Convert Timestamp
         } as SettlementType;
       });
       setPreviousMonthSettlements(fetched);
       setPreviousMonthSettlementsLoading(false);
     }, (error) => {
       console.error("Error fetching previous month settlements:", error);
       setPreviousMonthSettlementsLoading(false);
     });

     // Previous Month Expenses
     setPreviousMonthExpensesLoading(true);
     const prevExpensesCol = collection(db, "expenses");
     const prevExpensesQ = query(prevExpensesCol, where("month", "==", previousMonth));
     const unsubPrevExpenses = onSnapshot(prevExpensesQ, (snapshot) => {
         const fetched = snapshot.docs.map(doc => {
           const data = doc.data();
           return {
             id: doc.id,
             ...data,
             date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate() : new Date(), // Convert Timestamp
           } as Expense;
         });
         setPreviousMonthExpenses(fetched);
         setPreviousMonthExpensesLoading(false);
     }, (error) => {
         console.error("Error fetching previous month expenses:", error);
         setPreviousMonthExpensesLoading(false);
     });

     return () => {
       unsubPrevSettlements();
       unsubPrevExpenses();
     };
   }, [previousMonth, currentUser, toast]);

  // --- Calculate Summary ---
  // Define state for calculated settlement details
  const [settlementAmount, setSettlementAmount] = useState(0);
  const [settlementDirection, setSettlementDirection] = useState<{ fromUserId: string; toUserId: string } | null>(null);

  useEffect(() => {
    // Check if essential data is loading or missing
    if (expensesLoading || usersLoading || !currentUser || users.length < 2) {
       return; // Exit early if data isn't ready
    }

    // Match current user by document ID
    const user1 = users.find(u => u.id === currentUser.uid);
    const user2 = users.find(u => u.id !== currentUser.uid);

    if (!user1 || !user2) {
        console.error("Could not find both users. User1:", user1, "User2:", user2);
        setSummary(null);
        setSettlementAmount(0);
        setSettlementDirection(null);
        return;
    }

    // Use the calculation utility
    const settlementSummary = calculateSettlement(expenses, [user1, user2], currentMonth);

    if (!settlementSummary) {
      setSummary(null);
      setSettlementAmount(0);
      setSettlementDirection(null);
      return;
    }

    // Create the summary object using the new specific type
    const calculatedSummary: SettlementPageSummary = {
      month: currentMonth,
      totalExpenses: settlementSummary.totalExpenses,
      userExpenses: settlementSummary.userExpenses,
    };

    // Set the state without type assertion
    setSummary(calculatedSummary);

    // Update separate state for settlement details
    setSettlementAmount(settlementSummary.settlementAmount);
    setSettlementDirection(settlementSummary.settlementDirection);

  }, [expenses, users, currentUser, expensesLoading, usersLoading, currentMonth]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // --- Handle Settlement Creation ---
  const handleCreateSettlement = async () => {
    if (!currentUser || !settlementDirection || settlementAmount <= 0) {
      toast({
        title: "Cannot Create Settlement",
        description: "Missing required information or no settlement needed.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create settlement document
      const settlementData = {
        amount: settlementAmount,
        date: new Date(), // Current date
        month: currentMonth,
        fromUserId: settlementDirection.fromUserId,
        toUserId: settlementDirection.toUserId,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
      };

      const docRef = await addDoc(collection(db, "settlements"), settlementData);
      const newSettlement = { id: docRef.id, ...settlementData };

      // Send settlement email
      try {
        await sendSettlementEmail({
          settlement: newSettlement,
          expenses,
          users,
          month: currentMonth
        });

        toast({
          title: "Settlement Created",
          description: `Settlement of ${formatCurrency(settlementAmount)} recorded successfully. Email sent to both users.`,
        });
      } catch (emailError) {
        console.error("Error sending settlement email:", emailError);
        toast({
          title: "Settlement Created",
          description: `Settlement of ${formatCurrency(settlementAmount)} recorded successfully, but there was an error sending the email.`,
        });
      }

      // Close dialog if open
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating settlement:", error);
      toast({
        title: "Error",
        description: "Failed to create settlement. Please try again.",
        variant: "destructive"
      });
    }
  };

  // --- Handle Settlement Deletion ---
  const handleDeleteSettlement = async (settlementId: string) => {
    if (!currentUser) return;

    try {
      // Delete the settlement document
      await deleteDoc(doc(db, "settlements", settlementId));

      toast({
        title: "Settlement Deleted",
        description: "Settlement has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting settlement:", error);
      toast({
        title: "Error",
        description: "Failed to delete settlement. Please try again.",
        variant: "destructive"
      });
    }
  };

  // --- Check if there are unsettled expenses ---
  const hasUnsettledExpenses = settlementAmount > 0 && settlementDirection !== null;

  // --- Check if there are settlements for the current month ---
  const hasSettlements = settlements.length > 0;

  // --- Get user details for display ---
  const getFromUser = () => {
    if (!settlementDirection) return null;
    return users.find(u => u.id === settlementDirection.fromUserId);
  };

  const getToUser = () => {
    if (!settlementDirection) return null;
    return users.find(u => u.id === settlementDirection.toUserId);
  };

  const fromUser = getFromUser();
  const toUser = getToUser();

  // --- Check if previous month has unsettled expenses ---
  const [previousMonthUnsettled, setPreviousMonthUnsettled] = useState(false);

  useEffect(() => {
    if (previousMonthExpensesLoading || previousMonthSettlementsLoading || users.length < 2) {
      return;
    }

    // If there are no expenses or there are settlements, consider it settled
    if (previousMonthExpenses.length === 0 || previousMonthSettlements.length > 0) {
      setPreviousMonthUnsettled(false);
      return;
    }

    // Otherwise, calculate if there's a settlement needed
    const user1 = users.find(u => u.id === currentUser?.uid);
    const user2 = users.find(u => u.id !== currentUser?.uid);

    if (!user1 || !user2) {
      setPreviousMonthUnsettled(false);
      return;
    }

    const prevSettlementSummary = calculateSettlement(
      previousMonthExpenses,
      [user1, user2],
      previousMonth
    );

    // If there's a settlement amount and direction, it's unsettled
    setPreviousMonthUnsettled(
      !!prevSettlementSummary &&
      prevSettlementSummary.settlementAmount > 0 &&
      prevSettlementSummary.settlementDirection !== null
    );

  }, [previousMonthExpenses, previousMonthSettlements, previousMonthExpensesLoading,
      previousMonthSettlementsLoading, users, currentUser, previousMonth]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settlement</h1>
          <MonthSelector value={currentMonth} onChange={handleMonthChange} />
        </div>

        {/* Previous Month Alert */}
        {previousMonthUnsettled && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <div className="text-amber-500 mt-0.5">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800">Previous Month Unsettled</h3>
              <p className="text-sm text-amber-700 mt-1">
                There are unsettled expenses from {formatMonthYear(previousMonth)}.
                <button
                  onClick={() => setCurrentMonth(previousMonth)}
                  className="ml-1 text-amber-800 underline hover:text-amber-900"
                >
                  View and settle
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Current Month Settlement Status */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Settlement Status</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading || usersLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full max-w-md" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : hasSettlements ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <div className="text-green-500 mt-0.5">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-green-800">All Settled!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    All expenses for {formatMonthYear(currentMonth)} have been settled.
                  </p>
                </div>
              </div>
            ) : !hasUnsettledExpenses ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                <div className="text-gray-400 mt-0.5">
                  <X className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">No Settlement Needed</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {expenses.length === 0
                      ? `No expenses recorded for ${formatMonthYear(currentMonth)}.`
                      : `Expenses for ${formatMonthYear(currentMonth)} are already balanced.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-800">Settlement Needed</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Based on the expenses for {formatMonthYear(currentMonth)}, a settlement is needed.
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-blue-200">
                        <AvatarImage src={fromUser?.photoURL || ''} alt={fromUser?.username || ''} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {fromUser?.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{fromUser?.username}</p>
                        <p className="text-sm text-gray-500">Owes</p>
                      </div>
                    </div>

                    <div className="hidden sm:block text-gray-400">→</div>
                    <div className="block sm:hidden border-l-2 border-gray-200 h-6 ml-5"></div>

                    <div className="flex items-center gap-3 ml-0 sm:ml-0">
                      <Avatar className="h-10 w-10 border border-blue-200">
                        <AvatarImage src={toUser?.photoURL || ''} alt={toUser?.username || ''} />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {toUser?.username?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{toUser?.username}</p>
                        <p className="text-sm text-gray-500">Receives</p>
                      </div>
                    </div>

                    <div className="ml-0 sm:ml-auto">
                      <div className="text-lg font-bold text-blue-700">
                        {formatCurrency(settlementAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Record Settlement
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settlement History */}
        <SettlementHistory
          settlements={settlements}
          users={users}
          isLoading={settlementsLoading || usersLoading}
          onUnsettlement={handleDeleteSettlement}
        />

        {/* Settlement Dialog */}
        <ResponsiveDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          title="Confirm Settlement"
          description="Review and confirm the settlement details"
          footer={
            <>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateSettlement}>
                Confirm Settlement
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Please confirm that {fromUser?.username} has paid {toUser?.username} the amount of {formatCurrency(settlementAmount)}.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">{fromUser?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium">{toUser?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">{formatCurrency(settlementAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(new Date())}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Month</p>
                  <p className="font-medium">{formatMonthYear(currentMonth)}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              This will record the settlement and mark all expenses for {formatMonthYear(currentMonth)} as settled.
            </p>
          </div>
        </ResponsiveDialog>
      </div>
    </MainLayout>
  );
}