import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import MonthSelector from "@/components/MonthSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSummary, User, TrendData, Expense, Settlement, Category, Location } from "@shared/schema"; // Import necessary types
import { getCurrentMonth, formatCurrency, getMonthFromDate } from "@/lib/utils"; // Added getMonthFromDate
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { announce } from "@/components/LiveRegion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Import chart components
import EnhancedTrendChart from "@/components/EnhancedTrendChart";
import EnhancedDataChart from "@/components/EnhancedDataChart";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";
import SimpleTrendChart from "@/components/SimpleTrendChart";
import SimpleDataTable from "@/components/SimpleDataTable";
import { useAuth } from "@/context/AuthContext";
import { useFeatureFlags } from "@/context/FeatureFlagContext";

import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { subMonths, startOfMonth } from "date-fns";

export default function Analytics() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null); // Keep printRef if PDF export via print is still desired elsewhere or potentially later
  const { currentUser, loading: authLoading } = useAuth(); // Removed initialized, added loading alias
  const { flags, toggleFlag } = useFeatureFlags();

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

  // Effect to show message if not logged in after auth check completes
  useEffect(() => {
    if (!authLoading && !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view analytics.",
        variant: "destructive",
      });
    }
  }, [authLoading, currentUser, toast]);

  // Fetch Users
  useEffect(() => {
    if (!currentUser) { // Only proceed if user is logged in
        setUsersLoading(false); // Ensure loading is false if no user
        setUsers([]); // Clear users if logged out
        return;
    };

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
  }, [currentUser, toast]); // Depend only on currentUser

  // Fetch Categories
  useEffect(() => {
     if (!currentUser) { // Only proceed if user is logged in
        setCategoriesLoading(false);
        setCategories([]);
        return;
    };

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
  }, [currentUser, toast]); // Depend only on currentUser

  // Fetch Locations (Can run even if not logged in, maybe?) - Assuming yes for now
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
       toast({ // Added toast on error
        title: "Error",
        description: "Could not load locations.",
        variant: "destructive"
      });
    });
    return () => unsubscribe();
  }, [toast]); // Removed currentUser dependency if locations are public/global

  // Fetch Current Month Expenses
  useEffect(() => {
    if (!currentUser) {
        setCurrentMonthExpensesLoading(false);
        setCurrentMonthExpenses([]);
        return;
    };
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
       toast({ // Added toast on error
        title: "Error",
        description: "Could not load current month expenses.",
        variant: "destructive"
      });
    });
    return () => unsubscribe();
  }, [currentMonth, currentUser, toast]); // Added toast

  // Fetch Current Month Settlements
   useEffect(() => {
     if (!currentUser) {
        setCurrentMonthSettlementsLoading(false);
        setCurrentMonthSettlements([]);
        return;
     };
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
        toast({ // Added toast on error
            title: "Error",
            description: "Could not load settlements.",
            variant: "destructive"
        });
     });
     return () => unsubscribe();
   }, [currentMonth, currentUser, toast]); // Added toast

   // Fetch Expenses for Trend Calculation (e.g., last 6 months)
   useEffect(() => {
     if (!currentUser) {
        setTrendExpensesLoading(false);
        setTrendExpenses([]);
        return;
     };
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
          toast({ // Added toast on error
            title: "Error",
            description: "Could not load trend data.",
            variant: "destructive"
          });
     });

     return () => unsubscribe();
   }, [currentUser, toast]); // Added toast


  // --- Calculations ---

  // Calculate Summary for Current Month
  useEffect(() => {
    // Ensure user is logged in and required data is loaded
    if (!currentUser || currentMonthExpensesLoading || usersLoading || currentMonthSettlementsLoading || categoriesLoading || locationsLoading) {
      setSummaryLoading(true);
      return;
    }
    // Also ensure we have at least two users for a meaningful summary
     if (users.length < 2) {
        console.warn("Summary calculation requires at least two users.");
        setSummary(null);
        setSummaryLoading(false);
        return;
    }

    setSummaryLoading(true);

    try {
      const user1 = users.find(u => u.id === currentUser.uid);
      const otherUsers = users.filter(u => u.id !== currentUser.uid);

      if (!user1) {
        console.error("Current user not found in the fetched users list.");
        setSummaryLoading(false);
        setSummary(null);
        return;
      }

      // For simplicity, assuming only one other user for now. Adapt if multi-user needed.
      if (otherUsers.length !== 1) {
        console.warn(`Expected exactly one other user for summary calculation, but found ${otherUsers.length}. Skipping summary.`);
        setSummaryLoading(false);
        setSummary(null);
        return;
      }

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
      else { settlementAmount = 0; settlementDirection = { fromUserId: user1.id, toUserId: user2.id }; } // Default direction if balanced

      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const locationMap = new Map(locations.map(l => [l.id, l]));

      const categoryTotals = Array.from(categoryTotalsMap.entries()).map(([id, amount]) => ({
          category: categoryMap.get(id) || { id, name: 'Unknown', color: '#888' },
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);

      const locationTotals = Array.from(locationTotalsMap.entries()).map(([id, amount]) => ({
          location: locationMap.get(id) || { id, name: 'Unknown' },
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      })).sort((a, b) => b.amount - a.amount);

      const calculatedSummary: MonthSummary = {
        month: currentMonth, totalExpenses, userExpenses: userExpensesPaid, settlementAmount, settlementDirection,
        categoryTotals, locationTotals, splitTypeTotals, dateDistribution: {}, // dateDistribution needs calculation if used
      };
      setSummary(calculatedSummary);
      setSummaryLoading(false);
      // Announce to screen readers when summary data is loaded
      announce(`Summary data loaded for ${currentMonth} with total expenses of ${formatCurrency(totalExpenses)}`, true);
    } catch (error) {
      console.error("Error calculating summary:", error);
      toast({
        title: "Error",
        description: "Could not calculate summary data. Please refresh the page.",
        variant: "destructive"
      });
      setSummaryLoading(false);
    }
    // Depend on all data sources and the current user
  }, [currentUser, currentMonthExpensesLoading, usersLoading, currentMonthSettlementsLoading, categoriesLoading, locationsLoading, users, currentMonthExpenses, currentMonthSettlements, toast, categories, locations, currentMonth]);

  // Calculate Trend Data using useMemo for better performance
  const calculatedTrendData = useMemo(() => {
      // Return null if data isn't ready
      if (!currentUser || trendExpensesLoading || categoriesLoading || locationsLoading) {
          return null;
      }

      const monthlyTotals: Record<string, number> = {};
      const categoryMonthly: Record<string, Record<string, number>> = {};
      const locationMonthly: Record<string, Record<string, number>> = {};

      // Process all expenses to calculate totals
      trendExpenses.forEach(exp => {
          const month = getMonthFromDate(exp.date);
          const amount = Number(exp.amount) || 0;

          monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;

          if (!categoryMonthly[exp.categoryId]) categoryMonthly[exp.categoryId] = {};
          categoryMonthly[exp.categoryId][month] = (categoryMonthly[exp.categoryId][month] || 0) + amount;

          if (!locationMonthly[exp.locationId]) locationMonthly[exp.locationId] = {};
          locationMonthly[exp.locationId][month] = (locationMonthly[exp.locationId][month] || 0) + amount;
      });

      // Sort months chronologically
      const months = Object.keys(monthlyTotals).sort();
      const totalsByMonth = months.map(month => monthlyTotals[month]);

      // Create maps for efficient lookups
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      const locationMap = new Map(locations.map(l => [l.id, l.name]));

      // Process category data
      const categoriesData: Record<string, number[]> = {};
      for (const catId in categoryMonthly) {
          const catName = categoryMap.get(catId) || `Unknown (${catId.substring(0,4)})`;
          categoriesData[catName] = months.map(month => categoryMonthly[catId][month] || 0);
      }

      // Process location data
      const locationsData: Record<string, number[]> = {};
      for (const locId in locationMonthly) {
          const locName = locationMap.get(locId) || `Unknown (${locId.substring(0,4)})`;
          locationsData[locName] = months.map(month => locationMonthly[locId][month] || 0);
      }

      // Return the calculated trend data
      return {
          months,
          totalsByMonth,
          categoriesData,
          locationsData,
      } as TrendData;
  }, [currentUser, trendExpenses, categories, locations, trendExpensesLoading, categoriesLoading, locationsLoading]);

  // Update state based on calculated data
  useEffect(() => {
      setTrendDataLoading(true);
      if (calculatedTrendData) {
          setTrendData(calculatedTrendData);
          setTrendDataLoading(false);
          // Announce to screen readers when data is loaded
          announce(`Trend data loaded with ${calculatedTrendData.months.length} months of data`);
      } else {
          setTrendData(null);
          setTrendDataLoading(false);
      }
  }, [calculatedTrendData]);


  // --- Event Handlers ---
  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Removed handleExport function

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
  // Combine all relevant loading states
  const isLoading = authLoading || summaryLoading || usersLoading || trendDataLoading || categoriesLoading || locationsLoading || currentMonthExpensesLoading || currentMonthSettlementsLoading;

  // Show global loading if auth is still loading
  if (authLoading) {
     return (
       <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
         <div className="text-center space-y-4">
           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
           <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Loading Analytics...</h2>
         </div>
       </div>
     );
  }

  // Show message if not logged in after auth check
  if (!currentUser) {
     return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <p className="text-lg text-gray-600 dark:text-gray-400">Please log in to view analytics.</p>
        </div>
     );
  }

  // Main content render
  return (
    <div className="space-y-6 px-4 md:px-6 pb-24"> {/* Changed padding here */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Analytics</h1>
        <div className="flex items-center space-x-2">
          <Switch
            id="charts-toggle"
            checked={flags.enableCharts}
            onCheckedChange={() => toggleFlag('enableCharts')}
          />
          <Label htmlFor="charts-toggle" className="text-sm text-gray-600 dark:text-gray-400">
            {flags.enableCharts ? 'Charts Enabled' : 'Charts Disabled'}
          </Label>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <MonthSelector
            value={currentMonth}
            onChange={handleMonthChange}
            // Removed onExport prop
          />
        </div>
      </div>

      <div ref={printRef} className="space-y-6">
        {/* Summary Card */}
        <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4"><CardTitle className="text-xl">Monthly Summary</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-24 w-full" /> : (
              summary ? ( // Check if summary exists
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary mt-2 financial-value">{formatCurrency(summary.totalExpenses)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Settlement: <span className="font-medium financial-value">{formatCurrency(summary.settlementAmount)}</span></p>
                </div>
              ) : (
                 <div className="p-8 text-center"><p className="text-gray-600 dark:text-gray-400">No summary data available for this month.</p></div>
              )
            )}
          </CardContent>
        </Card>

        {/* User comparison chart */}
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : summary && Object.keys(summary.userExpenses).length > 0 ? (
          flags.enableCharts ? (
            <ChartErrorBoundary
              fallback={
                <SimpleDataTable
                  title="User Expense Comparison"
                  data={Object.entries(summary.userExpenses).map(([userId, amount]) => ({
                    name: getUsernameById(userId),
                    value: amount,
                  }))}
                  valueFormatter={formatCurrency}
                  height={350}
                />
              }
            >
              <EnhancedDataChart
                title="User Expense Comparison"
                data={Object.entries(summary.userExpenses).map(([userId, amount]) => ({
                  name: getUsernameById(userId),
                  value: amount,
                }))}
                valueFormatter={formatCurrency}
                height={350}
                isLoading={false}
              />
            </ChartErrorBoundary>
          ) : (
            <SimpleDataTable
              title="User Expense Comparison"
              data={Object.entries(summary.userExpenses).map(([userId, amount]) => ({
                name: getUsernameById(userId),
                value: amount,
              }))}
              valueFormatter={formatCurrency}
              height={350}
            />
          )
        ) : (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>User Expense Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No user expense data available.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Chart */}
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : summary && summary.categoryTotals && summary.categoryTotals.length > 0 ? (
          flags.enableCharts ? (
            <ChartErrorBoundary
              fallback={
                <SimpleDataTable
                  title="Expenses by Category"
                  data={summary.categoryTotals.map(item => ({
                    name: item.category.name,
                    value: item.amount,
                    percentage: item.percentage,
                  }))}
                  valueFormatter={formatCurrency}
                  height={350}
                />
              }
            >
              <EnhancedDataChart
                title="Expenses by Category"
                data={summary.categoryTotals.map(item => ({
                  name: item.category.name,
                  value: item.amount,
                  percentage: item.percentage,
                }))}
                valueFormatter={formatCurrency}
                height={350}
                isLoading={false}
              />
            </ChartErrorBoundary>
          ) : (
            <SimpleDataTable
              title="Expenses by Category"
              data={summary.categoryTotals.map(item => ({
                name: item.category.name,
                value: item.amount,
                percentage: item.percentage,
              }))}
              valueFormatter={formatCurrency}
              height={350}
            />
          )
        ) : (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No category data available.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Chart */}
        {isLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : summary && summary.locationTotals && summary.locationTotals.length > 0 ? (
          flags.enableCharts ? (
            <ChartErrorBoundary
              fallback={
                <SimpleDataTable
                  title="Expenses by Location"
                  data={summary.locationTotals.map(item => ({
                    name: item.location.name,
                    value: item.amount,
                    percentage: item.percentage,
                  }))}
                  valueFormatter={formatCurrency}
                  height={350}
                />
              }
            >
              <EnhancedDataChart
                title="Expenses by Location"
                data={summary.locationTotals.map(item => ({
                  name: item.location.name,
                  value: item.amount,
                  percentage: item.percentage,
                }))}
                valueFormatter={formatCurrency}
                height={350}
                isLoading={false}
              />
            </ChartErrorBoundary>
          ) : (
            <SimpleDataTable
              title="Expenses by Location"
              data={summary.locationTotals.map(item => ({
                name: item.location.name,
                value: item.amount,
                percentage: item.percentage,
              }))}
              valueFormatter={formatCurrency}
              height={350}
            />
          )
        ) : (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Expenses by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No location data available.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trend Chart */}
        {isLoading || trendDataLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : trendData && trendData.months && trendData.months.length > 0 ? (
          flags.enableCharts ? (
            <ChartErrorBoundary
              fallback={<SimpleTrendChart trendData={trendData} isLoading={false} />}
            >
              <EnhancedTrendChart trendData={trendData} isLoading={false} />
            </ChartErrorBoundary>
          ) : (
            <SimpleTrendChart trendData={trendData} isLoading={false} />
          )
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">No trend data available.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
