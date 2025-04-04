import React, { useState, useEffect } from "react";
import MonthSelector from "@/components/MonthSelector";
// Removed unused SummaryCard import
// import SummaryCard from "@/components/SummaryCard";
import SettlementHistory from "@/components/SettlementHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import { Tooltip } from "@/components/ui/tooltip"; // Import Tooltip
import { Check, CalendarClock, X } from "lucide-react";
import { Settlement as SettlementType, User, Expense } from "@shared/schema"; // Import correct types (MonthSummary removed as it's not fully used here)
import { getCurrentMonth, formatCurrency, getPreviousMonth, formatDate } from "@/lib/utils"; // Added formatDate
// Removed format import from date-fns
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"; // Import ResponsiveDialog
import { DialogFooter, DialogClose } from "@/components/ui/dialog"; // Import DialogFooter & DialogClose from base dialog
// Removed unused AlertDialog imports
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { db } from "@/lib/firebase"; // Import Firestore instance
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
  serverTimestamp // Import serverTimestamp
} from "firebase/firestore";

// Define a specific type for the summary data needed on this page
interface SettlementPageSummary {
  month: string;
  totalExpenses: number;
  userExpenses: Record<string, number>; // { userId: amount }
}

export default function Settlement() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const isMobile = useIsMobile(); // Use the hook

  // State for Firestore data
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]); // Need expenses for summary
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [settlements, setSettlements] = useState<SettlementType[]>([]);
  const [settlementsLoading, setSettlementsLoading] = useState(true);
  // Use the new specific type for summary state
  const [summary, setSummary] = useState<SettlementPageSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [previousMonthSettlements, setPreviousMonthSettlements] = useState<SettlementType[]>([]);
  const [previousMonthSettlementsLoading, setPreviousMonthSettlementsLoading] = useState(true);
  const [previousMonthExpenses, setPreviousMonthExpenses] = useState<Expense[]>([]);
  const [previousMonthExpensesLoading, setPreviousMonthExpensesLoading] = useState(true);
  const [isSettling, setIsSettling] = useState(false); // State for settlement in progress


  // --- Firestore Listener for Users ---
  useEffect(() => {
    setUsersLoading(true);
    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        // id field matches Firebase UID
        email: doc.data().email || null,
        username: doc.data().username,
        photoURL: doc.data().photoURL || undefined // Fetch photoURL
      } as User));
      setUsers(fetchedUsers);
      setUsersLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Could not load user data.", variant: "destructive" });
      setUsersLoading(false);
    });
    return () => unsubscribe();
  }, [toast]);

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
           id: doc.id,
           ...data,
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
    if (expensesLoading || usersLoading || settlementsLoading || !currentUser || users.length < 2) {
      setSummaryLoading(true); return;
    }
    setSummaryLoading(true);
    // Match current user by document ID
    const user1 = users.find(u => u.id === currentUser.uid);
    const user2 = users.find(u => u.id !== currentUser.uid);

    if (!user1 || !user2) {
        console.error("Could not find both users. User1:", user1, "User2:", user2);
        setSummaryLoading(false);
        setSummary(null);
        setSettlementAmount(0);
        setSettlementDirection(null);
        return;
    }

    let totalExpenses = 0; // Keep total for display if needed
    let totalSplitExpenses = 0;
    const userExpensesPaid: Record<string, number> = { [user1.id]: 0, [user2.id]: 0 };
    let user1_paid_50_50 = 0;
    let user1_paid_100_owed_by_other = 0; // User1 paid, User2 owes User1
    let user2_paid_100_owed_by_other = 0; // User2 paid, User1 owes User2

    expenses.forEach(exp => {
      const amount = Number(exp.amount) || 0;
      totalExpenses += amount; // Still calculate total overall expenses

      // Track who paid what
      if (exp.paidByUserId === user1.id) userExpensesPaid[user1.id] += amount;
      else if (exp.paidByUserId === user2.id) userExpensesPaid[user2.id] += amount;

      // Handle different split types for balance calculation
      // Default to "50/50" if splitType is missing or null
      const splitType = exp.splitType || "50/50";

      if (splitType === "50/50") {
        totalSplitExpenses += amount;
        if (exp.paidByUserId === user1.id) {
           user1_paid_50_50 += amount;
         }
      } else if (splitType === "100%") {
        // Assumption: If split is 100%, the person who *didn't* pay owes the full amount.
        if (exp.paidByUserId === user1.id) {
          // User1 paid, so User2 owes User1 this amount
          user1_paid_100_owed_by_other += amount;
        } else if (exp.paidByUserId === user2.id) {
          // User2 paid, so User1 owes User2 this amount
          user2_paid_100_owed_by_other += amount;
        }
      }
      // Add handling for other split types if they exist
    });

    const fairShare = totalSplitExpenses / 2;

    // Calculate User1's balance relative to the fair share and 100% splits
    // Positive balance means User2 owes User1
    // Negative balance means User1 owes User2
    const user1Balance = user1_paid_50_50 - fairShare + user1_paid_100_owed_by_other - user2_paid_100_owed_by_other;

    // Use user1Balance to determine settlement direction and amount
    const finalBalance = user1Balance; // Use the correctly calculated balance

    // Determine settlement amount and direction based on final balance
    let calculatedSettlementAmount = 0;
    let calculatedSettlementDirection: { fromUserId: string; toUserId: string } | null = null;

    // Use a small threshold to avoid floating point issues near zero
    const threshold = 0.005;
    if (finalBalance < -threshold) { // User1 owes User2
      calculatedSettlementAmount = Math.abs(finalBalance);
      calculatedSettlementDirection = { fromUserId: user1.id, toUserId: user2.id };
    } else if (finalBalance > threshold) { // User2 owes User1
      calculatedSettlementAmount = finalBalance;
      calculatedSettlementDirection = { fromUserId: user2.id, toUserId: user1.id };
    } else { // Considered settled
      calculatedSettlementAmount = 0;
      calculatedSettlementDirection = null; // Or keep previous direction if needed for display? Set to null for clarity.
    }

    // Create the summary object using the new specific type
    const calculatedSummary: SettlementPageSummary = {
      month: currentMonth, // Use currentMonth here
      totalExpenses: totalExpenses, // Use the overall total here
      userExpenses: userExpensesPaid,
    };
    // Set the state without type assertion
    setSummary(calculatedSummary);

    // Update separate state for settlement details
    setSettlementAmount(calculatedSettlementAmount);
    setSettlementDirection(calculatedSettlementDirection);

    setSummaryLoading(false);
    // Added currentMonth to dependency array
  }, [expenses, users, currentUser, expensesLoading, usersLoading, currentMonth]); // Removed settlements & settlementsLoading


  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Updated handleUnsettlement using Firestore
  const handleUnsettlement = async (settlementId: string) => { // ID is now string
    try {
      const settlementRef = doc(db, "settlements", settlementId);
      await deleteDoc(settlementRef);
      toast({
        title: "Settlement removed",
        description: "The settlement has been removed successfully."
      });
      // No need to manually refetch/invalidate, listener handles it
    } catch (error) {
      console.error("Error removing settlement:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove settlement",
        variant: "destructive"
      });
    }
  };

  // Updated handleSettlement using Firestore
  const handleSettlement = async () => {
    const isSettled = !settlementsLoading && settlements && settlements.length > 0; // Recalculate inside handler
    if (isSettled) {
      toast({ title: "Already settled", variant: "destructive" }); return;
    }
    // Use the separate settlementAmount state
    if (!settlementDirection || settlementAmount <= 0) {
      toast({ title: "Nothing to settle", description: "The balance is zero.", variant: "default" }); return;
    }
    if (!currentUser) {
       toast({ title: "Error", description: "User not logged in.", variant: "destructive" }); return;
    }

    setIsSettling(true); // Start settling process
    setIsDialogOpen(false); // Close dialog immediately

    try {
      const settlementData = {
        month: currentMonth,
        amount: settlementAmount, // Use state variable
        date: Timestamp.now(), // Use Firestore Timestamp
        fromUserId: settlementDirection.fromUserId, // Use state variable
        toUserId: settlementDirection.toUserId, // Use state variable
        notes: `Settlement for ${currentMonth}`,
        recordedBy: currentUser.uid, // Optional: track who recorded
        createdAt: serverTimestamp() // Use server timestamp
      };

      await addDoc(collection(db, "settlements"), settlementData);

      toast({
        title: "Settlement recorded",
        description: "The settlement has been recorded successfully."
      });
      // No need to manually refetch/invalidate, listener handles it
    } catch (error) {
      console.error('Settlement error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to record settlement.",
        variant: "destructive"
      });
    } finally {
      setIsSettling(false); // End settling process
    }
  };

  // Find user names based on IDs
  const getUserName = (userId: string): string => {
    // Use Firestore document ID for matching
    const user = users.find(u => u.id === userId);
    return user?.username || user?.email?.split('@')[0] || `User...`; // Fallback logic
  };

  // Use settlementDirection state
  const fromUserName = settlementDirection?.fromUserId
    ? getUserName(settlementDirection.fromUserId)
    : "User A";

  const toUserName = settlementDirection?.toUserId
    ? getUserName(settlementDirection.toUserId)
    : "User B";

// Check if a settlement exists for this month (use state)
const isSettled = !settlementsLoading && settlements && settlements.length > 0;

  // Check previous month status
  const previousMonthIsSettled = !previousMonthSettlementsLoading && previousMonthSettlements && previousMonthSettlements.length > 0;
  const hasPreviousMonthExpenses = !previousMonthExpensesLoading && previousMonthExpenses && previousMonthExpenses.length > 0;
  const showUnsettledWarning = (!previousMonthIsSettled && hasPreviousMonthExpenses);
return (
    <div className="space-y-6 px-2 sm:px-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Settlement</h1>
      </div>

      <MonthSelector value={currentMonth} onChange={handleMonthChange} />

      {/* Unsettled months card */}
      {showUnsettledWarning && (
        <Card className="bg-amber-50 border-amber-200 mt-4">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center">
                <div className="p-2 rounded-full bg-amber-100 flex-shrink-0">
                  <CalendarClock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Unsettled Month</h3>
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  <p className="text-sm text-amber-600 mt-1">The previous month hasn't been settled yet.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current settlement card */}
        <Card className="border-gray-200"> {/* Added border class */}
          <CardHeader><CardTitle>Current Month Settlement</CardTitle></CardHeader>
          <CardContent>
            {summaryLoading || usersLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                {/* DEBUG LOGS OUTSIDE CONDITION */}
                {/* Removed console logs */}
                <div className="flex flex-col items-center text-center mb-4"> {/* Changed layout to flex column */}
                  {/* Display logic based on isSettled */}
                  {isSettled && settlements.length > 0 ? (
                    // --- Settled State ---
                    <>
                      {(() => {
                        // Show avatar of the user who received payment
                        const receivingUserId = settlements[0].toUserId;
                        const receivingUser = users.find(u => u.id === receivingUserId);
                        const name = receivingUser ? getUserName(receivingUserId) : 'User';
                        return (
                          <Avatar className="h-12 w-12 mb-2">
                            <AvatarImage src={receivingUser?.photoURL} alt={name} />
                            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        );
                      })()}
                      <p className="text-sm text-gray-500">Month Settled</p>
                      <p className="text-3xl font-bold mt-1 text-green-600">
                        {/* Display actual settled amount */}
                        {formatCurrency(settlements[0].amount)}
                      </p>
                    </>
                  ) : (
                    // --- Unsettled State ---
                    <>
                      {/* Conditionally render Avatar based on who owes */}
                      {settlementAmount > 0 && settlementDirection && (() => {
                          // Add null check for settlementDirection
                          if (!settlementDirection) return null;
                          const userIdToFind = settlementDirection.fromUserId;
                          const foundUser = users.find(u => u.id === userIdToFind);
                          // Add null check for foundUser
                          if (!foundUser) return null;
                          const name = fromUserName || 'User';
                          return (
                            <Avatar className="h-12 w-12 mb-2">
                              {/* Add null check for photoURL */}
                              <AvatarImage src={foundUser.photoURL ?? undefined} alt={name} />
                              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          );
                      })()}
                      <p className="text-sm text-gray-500">
                        {/* Show who owes whom or "All settled up" */}
                        {settlementAmount > 0 && settlementDirection
                          ? `${fromUserName} owes ${toUserName}`
                          : "All settled up!"}
                      </p>
                      <p className={`text-3xl font-bold mt-1 ${settlementAmount > 0 ? 'text-primary' : 'text-green-600'}`}>
                         {/* Display calculated amount needed to settle */}
                        {formatCurrency(Math.floor(settlementAmount * 100) / 100)}
                      </p>
                    </>
                  )}
                </div>

                 {/* Use settlementAmount state */}
                {!isSettled && settlementAmount > 0 && !summaryLoading && ( // Added !summaryLoading check
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => setIsDialogOpen(true)}
                    disabled={isSettling} // Disable if already settling
                  >
                    <Check className="mr-2 h-4 w-4" /> Mark as Settled
                  </Button>
                )}

                {isSettled && settlements && settlements.length > 0 && (
                  <div className="flex items-center justify-between bg-green-50 text-green-600 p-3 rounded-md">
                    <p className="text-sm font-medium">Settled on {formatDate(settlements[0].date)}</p> {/* Use formatDate */}
                    <Button onClick={() => handleUnsettlement(settlements[0].id)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-100">
                      <X className="h-4 w-4" />
                      {/*
                        Consider adding a confirmation dialog for unsettlement as well,
                        and potentially disabling this button while isSettling is true
                        if unsettling should be blocked during settlement.
                      */}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* User summaries - Applying fixes */}
        <div className="grid grid-cols-2 gap-4">
          {summaryLoading || usersLoading ? (
            <>
              <Skeleton className="h-24 w-full" /> {/* Adjusted skeleton height */}
              <Skeleton className="h-24 w-full" />
            </>
          ) : (
            users.map((user) => {
              // Access amount from the userExpenses record using the user's Firestore ID
              const amountPaid = summary?.userExpenses?.[user.id] ?? 0;
              const userName = getUserName(user.id); // Get username once

              // Define the card content JSX first
              const userCardContent = (
                <Card className="border-gray-200 overflow-hidden"> {/* Use Card, add overflow */}
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 flex-shrink-0"> {/* Added flex-shrink-0 */}
                        <AvatarImage src={user.photoURL} alt={userName} />
                        <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0"> {/* Added flex-1 and min-w-0 */}
                        {/* Hide text on small screens (mobile), show on sm and up. Added truncate */}
                        <p className="text-sm font-medium text-gray-700 hidden sm:block truncate">{userName} Paid</p>
                        {/* Added truncate */}
                        <p className="text-lg font-semibold text-gray-900 truncate">{formatCurrency(amountPaid)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );

              // Return the content, conditionally wrapped with Tooltip only on mobile
              // Ensure the key is on the outermost element returned in each branch
              return isMobile ? (
                <Tooltip key={user.id} content={`${userName} Paid`} position="bottom">
                  {userCardContent}
                </Tooltip>
              ) : (
                 // Use React.Fragment or just the content if no wrapper needed, but key must be on the top element
                 // Using Fragment here to ensure key is applied correctly
                <React.Fragment key={user.id}>
                  {userCardContent}
                </React.Fragment>
              );
            })
          )}
        </div> {/* Closes inner grid */}
      </div> {/* Closes outer grid */}

      {/* Settlement history */}
      <SettlementHistory
        settlements={settlements || []} // Pass base settlements
        isLoading={settlementsLoading}
        onUnsettlement={handleUnsettlement}
        users={users} // Pass users for name lookup
      />

      {/* Confirmation Dialog - Placed inside the main div */}
      <ResponsiveDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Confirm Settlement"
        description={`Are you sure you want to mark this month as settled? This action will record a settlement of ${formatCurrency(settlementAmount)} from ${fromUserName} to ${toUserName}.`}
      >
        <DialogFooter>
          <DialogClose asChild>
             {/* Use DialogClose for the cancel button */}
             <Button variant="outline">Cancel</Button>
          </DialogClose>
          {/* Remove AlertDialogAction wrapper, keep the Button */}
          <Button type="button" onClick={handleSettlement} disabled={isSettling}>
            {isSettling ? "Settling..." : "Confirm Settlement"}
          </Button>
        </DialogFooter>
      </ResponsiveDialog>

    </div> // Closing tag for the main div
  ); // Closing parenthesis for the component return
}
