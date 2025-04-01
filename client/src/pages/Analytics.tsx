import React, { useState, useRef, useCallback, useEffect } from "react";
import MonthSelector from "@/components/MonthSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSummary, User, TrendData, Expense, Settlement, Category, Location } from "@shared/schema"; // Import necessary types
import { getCurrentMonth, formatCurrency, getMonthFromDate } from "@/lib/utils"; // Added getMonthFromDate
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryChart from "@/components/CategoryChart";
import LocationChart from "@/components/LocationChart";
// Removed SplitTypeChart import
import TrendChart from "@/components/TrendChart";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { db } from "@/lib/firebase"; // Import Firestore instance
// Removed unused getDocs, limit, startAt, endAt imports
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
// Removed unused format, endOfMonth imports
import { subMonths, startOfMonth } from "date-fns"; // Import date-fns helpers

Chart.register(...registerables);

export default function Analytics() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const { currentUser, initialized } = useAuth();

  // State for Firestore data
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<Expense[]>([]);
  const [currentMonthExpensesLoading, setCurrentMonthExpensesLoading] = useState(true);
  const [currentMonthSettlements, setCurrentMonthSettlements] = useState<Settlement[]>([]);
  const [currentMonthSettlementsLoading, setCurrentMonthSettlementsLoading] = useState(true);
  const [trendExpenses, setTrendExpenses] = useState<Expense[]>([]);
  const [trendExpensesLoading, setTrendExpensesLoading] = useState(true);

  // State for calculated data
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [trendDataLoading, setTrendDataLoading] = useState(true);

  // Wait for auth to be initialized before loading data
  useEffect(() => {
    if (!initialized) {
      return;
    }
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view analytics.",
        variant: "destructive",
      });
      return;
    }
  }, [initialized, currentUser, toast]);

  // Fetch Users
  useEffect(() => {
    if (!initialized || !currentUser) return;

    setUsersLoading(true);
    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(fetchedUsers);
      setUsersLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Could not load user data. Please refresh the page.",
        variant: "destructive"
      });
      setUsersLoading(false);
    });
    return () => unsubscribe();
  }, [initialized, currentUser, toast]);

  // Fetch Categories
  useEffect(() => {
    if (!initialized || !currentUser) return;

    setCategoriesLoading(true);
    const catCol = collection(db, "categories");
    const q = query(catCol, orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCategories);
      setCategoriesLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Could not load categories. Please refresh the page.",
        variant: "destructive"
      });
      setCategoriesLoading(false);
    });
    return () => unsubscribe();
  }, [initialized, currentUser, toast]);

  // Fetch Locations
  useEffect(() => {
    setLocationsLoading(true);
    const locCol = collection(db, "locations");
    const q = query(locCol, orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLocations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
      setLocations(fetchedLocations);
      setLocationsLoading(false);
    }, (error) => {
      console.error("Error fetching locations:", error);
      setLocationsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Current Month Expenses
  useEffect(() => {
    if (!currentUser) return;
    setCurrentMonthExpensesLoading(true);
    const expensesCol = collection(db, "expenses");
    const q = query(expensesCol, where("month", "==", currentMonth), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedExpenses = snapshot.docs.map(doc => {
         const data = doc.data();
         return {
           id: doc.id, ...data,
           date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate() : new Date(),
         } as Expense;
      });
      setCurrentMonthExpenses(fetchedExpenses);
      setCurrentMonthExpensesLoading(false);
    }, (error) => {
      console.error("Error fetching current month expenses:", error);
      setCurrentMonthExpensesLoading(false);
    });
    return () => unsubscribe();
  }, [currentMonth, currentUser]);

  // Fetch Current Month Settlements
   useEffect(() => {
     if (!currentUser) return;
     setCurrentMonthSettlementsLoading(true);
     const settlementsCol = collection(db, "settlements");
     const q = query(settlementsCol, where("month", "==", currentMonth));
     const unsubscribe = onSnapshot(q, (snapshot) => {
       const fetchedSettlements = snapshot.docs.map(doc => {
         const data = doc.data();
         return {
           id: doc.id, ...data,
           date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate() : new Date(),
         } as Settlement;
       });
       setCurrentMonthSettlements(fetchedSettlements);
       setCurrentMonthSettlementsLoading(false);
     }, (error) => {
       console.error("Error fetching settlements:", error);
       setCurrentMonthSettlementsLoading(false);
     });
     return () => unsubscribe();
   }, [currentMonth, currentUser]);

   // Fetch Expenses for Trend Calculation (e.g., last 6 months)
   useEffect(() => {
     if (!currentUser) return;
     setTrendExpensesLoading(true);
     const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5)); // Start of month 6 months ago (inclusive)
     const expensesCol = collection(db, "expenses");
     const q = query(expensesCol, where("date", ">=", Timestamp.fromDate(sixMonthsAgo)), orderBy("date", "asc"));

     const unsubscribe = onSnapshot(q, (snapshot) => {
         const fetchedExpenses = snapshot.docs.map(doc => {
             const data = doc.data();
             return {
                 id: doc.id, ...data,
                 date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate() : new Date(),
             } as Expense;
         });
         setTrendExpenses(fetchedExpenses);
         setTrendExpensesLoading(false);
     }, (error) => {
         console.error("Error fetching trend expenses:", error);
         setTrendExpensesLoading(false);
     });

     return () => unsubscribe();
   }, [currentUser]);


  // --- Calculations ---

  // Calculate Summary for Current Month
  useEffect(() => {
    if (!initialized || !currentUser) return;
    if (currentMonthExpensesLoading || usersLoading || currentMonthSettlementsLoading || users.length < 2) {
      // Removed leftover console.log arguments
      setSummaryLoading(true);
      return;
    }

    setSummaryLoading(true);

    try {
      // Find current user by matching document ID to Firebase UID
      const user1 = users.find(u => u.id === currentUser.uid);
      // Find other users
      const otherUsers = users.filter(u => u.id !== currentUser.uid);

      if (!user1) {
        console.error("Current user not found in the fetched users list.");
        setSummaryLoading(false);
        setSummary(null);
        return;
      }

      if (otherUsers.length !== 1) {
        console.warn(`Expected exactly one other user for summary calculation, but found ${otherUsers.length}. Skipping summary.`);
        setSummaryLoading(false);
        setSummary(null); // Indicate no summary can be calculated
        return;
      }

      // Proceed with calculation only if exactly one other user exists
      const user2 = otherUsers[0];

      let totalExpenses = 0;
      const userExpensesPaid: Record<string, number> = { [user1.id]: 0, [user2.id]: 0 };
      const categoryTotalsMap = new Map<string, number>();
      const locationTotalsMap = new Map<string, number>();
      const splitTypeTotals: Record<string, number> = {};

      currentMonthExpenses.forEach(exp => {
        const amount = Number(exp.amount) || 0;
        totalExpenses += amount;
        if (exp.paidByUserId === user1.id) userExpensesPaid[user1.id] += amount;
        else if (exp.paidByUserId === user2.id) userExpensesPaid[user2.id] += amount;

        // Aggregate category/location/split totals
        categoryTotalsMap.set(exp.categoryId, (categoryTotalsMap.get(exp.categoryId) || 0) + amount);
        locationTotalsMap.set(exp.locationId, (locationTotalsMap.get(exp.locationId) || 0) + amount);
        splitTypeTotals[exp.splitType] = (splitTypeTotals[exp.splitType] || 0) + amount;
      });

      const fairShare = totalExpenses / 2;
      const user1Balance = userExpensesPaid[user1.id] - fairShare;
      let netSettlementFromUser1ToUser2 = 0;
      currentMonthSettlements.forEach(settle => {
        const amount = Number(settle.amount) || 0;
        if (settle.fromUserId === user1.id && settle.toUserId === user2.id) netSettlementFromUser1ToUser2 += amount;
        else if (settle.fromUserId === user2.id && settle.toUserId === user1.id) netSettlementFromUser1ToUser2 -= amount;
      });

      const finalBalance = user1Balance - netSettlementFromUser1ToUser2;
      let settlementAmount = Math.abs(finalBalance);
      let settlementDirection: { fromUserId: string; toUserId: string };
      if (finalBalance < -0.005) settlementDirection = { fromUserId: user1.id, toUserId: user2.id };
      else if (finalBalance > 0.005) settlementDirection = { fromUserId: user2.id, toUserId: user1.id };
      else { settlementAmount = 0; settlementDirection = { fromUserId: user1.id, toUserId: user2.id }; }

      // Map category/location totals with names
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const locationMap = new Map(locations.map(l => [l.id, l]));

      const categoryTotals = Array.from(categoryTotalsMap.entries()).map(([id, amount]) => ({
          category: categoryMap.get(id) || { id, name: 'Unknown', color: '#888' },
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      })).sort((a, b) => b.amount - a.amount); // Sort descending

      const locationTotals = Array.from(locationTotalsMap.entries()).map(([id, amount]) => ({
          location: locationMap.get(id) || { id, name: 'Unknown' },
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      })).sort((a, b) => b.amount - a.amount); // Sort descending

      const calculatedSummary: MonthSummary = {
        month: currentMonth, totalExpenses, userExpenses: userExpensesPaid, settlementAmount, settlementDirection,
        categoryTotals, locationTotals, splitTypeTotals, dateDistribution: {}, // Placeholder for dateDistribution
      };
      setSummary(calculatedSummary);
      setSummaryLoading(false);
    } catch (error) {
      console.error("Error calculating summary:", error);
      toast({
        title: "Error",
        description: "Could not calculate summary data. Please refresh the page.",
        variant: "destructive"
      });
      setSummaryLoading(false);
    }
    // Added currentMonth to dependencies as it's used in calculatedSummary
  }, [initialized, currentUser, currentMonthExpensesLoading, usersLoading, currentMonthSettlementsLoading, users, currentMonthExpenses, currentMonthSettlements, toast, categories, locations, currentMonth]);

  // Calculate Trend Data
  useEffect(() => {
      if (trendExpensesLoading || categoriesLoading || locationsLoading) {
          setTrendDataLoading(true); return;
      }
      setTrendDataLoading(true);

      const monthlyTotals: Record<string, number> = {};
      const categoryMonthly: Record<string, Record<string, number>> = {}; // { categoryId: { month: total } }
      const locationMonthly: Record<string, Record<string, number>> = {}; // { locationId: { month: total } }

      trendExpenses.forEach(exp => {
          const month = getMonthFromDate(exp.date); // Use utility function
          const amount = Number(exp.amount) || 0;

          // Monthly total
          monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;

          // Category monthly total
          if (!categoryMonthly[exp.categoryId]) categoryMonthly[exp.categoryId] = {};
          categoryMonthly[exp.categoryId][month] = (categoryMonthly[exp.categoryId][month] || 0) + amount;

          // Location monthly total
          if (!locationMonthly[exp.locationId]) locationMonthly[exp.locationId] = {};
          locationMonthly[exp.locationId][month] = (locationMonthly[exp.locationId][month] || 0) + amount;
      });

      // Get sorted list of months present in the data
      const months = Object.keys(monthlyTotals).sort();

      // Prepare final trend data structure
      const totalsByMonth = months.map(month => monthlyTotals[month]);

      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const locationMap = new Map(locations.map(l => [l.id, l.name]));

      const categoriesData: Record<string, number[]> = {};
      for (const catId in categoryMonthly) {
          const catName = categoryMap.get(catId) || `Unknown (${catId.substring(0,4)})`;
          categoriesData[catName] = months.map(month => categoryMonthly[catId][month] || 0);
      }

      const locationsData: Record<string, number[]> = {};
       for (const locId in locationMonthly) {
           const locName = locationMap.get(locId) || `Unknown (${locId.substring(0,4)})`;
           locationsData[locName] = months.map(month => locationMonthly[locId][month] || 0);
       }


      const calculatedTrendData: TrendData = {
          months,
          totalsByMonth,
          categoriesData,
          locationsData,
      };

      setTrendData(calculatedTrendData);
      setTrendDataLoading(false);

  // Added categories and locations to dependency array
  }, [trendExpenses, categories, locations, trendExpensesLoading, categoriesLoading, locationsLoading]);


  // --- Event Handlers ---
  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Removed unnecessary dependencies from useCallback
  const handlePrint = useCallback(() => { /* ... keep existing print logic ... */ }, []);

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    if (format === 'pdf') {
      handlePrint();
    } else {
      toast({ title: "Export not available", description: "Only PDF export is available.", variant: "default" });
    }
  };

  // Helper function to get username by ID
  const getUsernameById = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.username || user?.email?.split('@')[0] || `User...`;
  };

  // Prepare user expense comparison data
  const userExpenseData = {
    labels: summary?.userExpenses ? Object.keys(summary.userExpenses).map(id => getUsernameById(id)) : [],
    datasets: [ {
        label: "Expenses Paid",
        data: summary?.userExpenses ? Object.values(summary.userExpenses) : [],
        backgroundColor: ["#3B82F6", "#8B5CF6"], // Example colors
        borderColor: ["#2563EB", "#7C3AED"],
        borderWidth: 1
    } ]
  };

  // --- Render ---
  const isLoading = summaryLoading || usersLoading || trendDataLoading; // Combine loading states

  return (
    <div className="space-y-6 px-4 sm:px-0 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Analytics</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <MonthSelector
            value={currentMonth}
            onChange={handleMonthChange}
            onExport={handleExport}
          />
        </div>
      </div>

      <div ref={printRef} className="space-y-6">
        {/* Summary Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4"><CardTitle className="text-xl">Monthly Summary</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-24 w-full" /> : (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                <p className="text-3xl sm:text-4xl font-bold text-primary mt-2 financial-value">{formatCurrency(summary?.totalExpenses ?? 0)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Settlement: <span className="font-medium financial-value">{formatCurrency(summary?.settlementAmount ?? 0)}</span></p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User comparison chart */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3"><CardTitle className="text-xl">User Expense Comparison</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-64 w-full" /> : (summary && Object.keys(summary.userExpenses).length > 0 ? (
              <div className="h-[250px] sm:h-64">
                <Bar data={userExpenseData} options={{ responsive: true, maintainAspectRatio: false, /* ... other options */ }} />
              </div>
            ) : <div className="p-8 text-center"><p className="text-gray-600 dark:text-gray-400">No data.</p></div>
            )}
          </CardContent>
        </Card>

        {/* Other Charts - Pass undefined if summary/trendData is null */}
        <CategoryChart summary={summary || undefined} isLoading={isLoading} />
        <LocationChart summary={summary || undefined} isLoading={isLoading} />
        {/* Removed SplitTypeChart component */}
        <TrendChart trendData={trendData || undefined} isLoading={isLoading} />
      </div>
    </div>
  );
}
