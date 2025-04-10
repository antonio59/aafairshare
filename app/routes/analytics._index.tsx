import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@remix-run/react';
import { useAuth } from '~/contexts/AuthContext';
import MainLayout from '~/components/layouts/MainLayout';
import MonthSelector from '~/components/MonthSelector';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { useToast } from '~/hooks/use-toast';
import { Label } from '~/components/ui/label';
import { Skeleton } from '~/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import SimpleDataTable from '~/components/charts/SimpleDataChart';
import SimpleTrendChart from '~/components/charts/SimpleTrendChart';
import BarChart from '~/components/charts/BarChart';
import PieChart from '~/components/charts/PieChart';
import LineChart from '~/components/charts/LineChart';
import { formatCurrency, getCurrentMonth, getMonthFromDate } from '~/lib/utils';
import { getUserColor, getCategoryColor, getLocationColor } from '~/lib/chartColors';
import { db } from '~/lib/firebase';
import { calculateSettlement, calculateCategoryTotals, calculateLocationTotals } from '~/lib/expense-calculations';
import { collection, query, where, orderBy, onSnapshot, Timestamp, getDocs, addDoc } from 'firebase/firestore';
import { subMonths, startOfMonth } from 'date-fns';
import { ExpenseWithDetails, Category, Location, User } from '~/shared/schema';

// Define types for our data
interface MonthSummary {
  month: string;
  totalExpenses: number;
  userExpenses: Record<string, number>;
  settlementAmount: number;
  settlementDirection: { fromUserId: string; toUserId: string };
  categoryTotals: Array<{ category: Category; amount: number; percentage: number }>;
  locationTotals: Array<{ location: Location; amount: number; percentage: number }>;
}

interface TrendData {
  months: string[];
  totals: number[];
  categoryData?: Record<string, number[]>;
  locationData?: Record<string, number[]>;
}

export default function Analytics() {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  // Default to chart view for tabs
  const [activeView, setActiveView] = useState("chart");
  const [isLoading, setIsLoading] = useState(true);
  const [trendDataLoading, setTrendDataLoading] = useState(true);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, authLoading, navigate]);

  // Fetch categories
  useEffect(() => {
    if (!currentUser) return;
    const categoriesCol = collection(db, "categories");
    const unsubscribe = onSnapshot(categoriesCol, (snapshot) => {
      const fetchedCategories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(fetchedCategories);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Fetch locations
  useEffect(() => {
    if (!currentUser) return;
    const locationsCol = collection(db, "locations");
    const unsubscribe = onSnapshot(locationsCol, (snapshot) => {
      const fetchedLocations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Location[];
      setLocations(fetchedLocations);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Fetch users
  useEffect(() => {
    if (!currentUser) return;
    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(fetchedUsers);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Fetch expenses for current month
  useEffect(() => {
    if (!currentUser) return;
    if (categories.length === 0 || locations.length === 0 || users.length === 0) return;

    setIsLoading(true);
    const expensesCol = collection(db, "expenses");

    // Create a query for the current month
    const q = query(
      expensesCol,
      where("month", "==", currentMonth),
      orderBy("date", "desc")
    );

    console.log(`Fetching expenses for month: ${currentMonth}`);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log(`Got ${snapshot.docs.length} expenses for ${currentMonth}`);

      // Prepare maps for efficient lookups
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const locationMap = new Map(locations.map(l => [l.id, l]));
      const userMap = new Map(users.map(u => [u.id, u]));

      const fetchedExpenses = snapshot.docs.map(doc => {
        const data = doc.data();
        const expenseDate = data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date);
        const amount = Number(data.amount) || 0;
        const paidByUserId = data.paidByUserId || '';
        const categoryId = data.categoryId || '';
        const locationId = data.locationId || '';
        const splitType = data.splitType || '50/50';

        // Get related objects
        const category = categoryMap.get(categoryId);
        const location = locationMap.get(locationId);
        const paidByUser = userMap.get(paidByUserId);

        // Create the expense object with all details
        return {
          id: doc.id,
          ...data,
          date: expenseDate,
          amount: amount,
          paidByUserId: paidByUserId,
          categoryId: categoryId,
          locationId: locationId,
          splitType: splitType,
          category: category,
          location: location,
          paidByUser: paidByUser
        } as ExpenseWithDetails;
      });

      setExpenses(fetchedExpenses);
      setIsLoading(false);
      calculateSummary(fetchedExpenses);
    }, (error) => {
      console.error("Error fetching expenses:", error);
      toast({
        title: "Error",
        description: "Could not load expenses. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, currentMonth, categories, locations, users, toast]);

  // Fetch users, categories, and locations if they're not already loaded
  useEffect(() => {
    if (!currentUser) return;

    // Ensure we're using the current month
    const now = getCurrentMonth();
    if (currentMonth !== now) {
      setCurrentMonth(now);
    }

    // Fetch categories if needed
    if (categories.length === 0) {
      const fetchCategories = async () => {
        try {
          const categoriesCol = collection(db, "categories");
          const snapshot = await getDocs(categoriesCol);
          const fetchedCategories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Category[];
          setCategories(fetchedCategories);
        } catch (error) {
          console.error("Error fetching categories:", error);
          toast({
            title: "Error",
            description: "Could not load categories. Please try again.",
            variant: "destructive"
          });
        }
      };
      fetchCategories();
    }

    // Fetch locations if needed
    if (locations.length === 0) {
      const fetchLocations = async () => {
        try {
          const locationsCol = collection(db, "locations");
          const snapshot = await getDocs(locationsCol);
          const fetchedLocations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Location[];
          setLocations(fetchedLocations);
        } catch (error) {
          console.error("Error fetching locations:", error);
          toast({
            title: "Error",
            description: "Could not load locations. Please try again.",
            variant: "destructive"
          });
        }
      };
      fetchLocations();
    }

    // Fetch users if needed
    if (users.length === 0) {
      const fetchUsers = async () => {
        try {
          const usersCol = collection(db, "users");
          const snapshot = await getDocs(usersCol);
          const fetchedUsers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as User[];
          setUsers(fetchedUsers);
        } catch (error) {
          console.error("Error fetching users:", error);
          toast({
            title: "Error",
            description: "Could not load users. Please try again.",
            variant: "destructive"
          });
        }
      };
      fetchUsers();
    }
  }, [currentUser, currentMonth, categories.length, locations.length, users.length, toast]);

  // Debug logging to help diagnose issues
  useEffect(() => {
    if (currentUser && expenses.length === 0 && !isLoading) {
      console.log('No expenses found for month:', currentMonth);
      console.log('Current user:', currentUser.uid);
    }
  }, [currentUser, expenses, isLoading, currentMonth]);

  // Fetch trend data (last 6 months)
  useEffect(() => {
    if (!currentUser) return;
    setTrendDataLoading(true);

    const fetchTrendData = async () => {
      try {
        const expensesCol = collection(db, "expenses");
        const today = new Date();
        const sixMonthsAgo = subMonths(startOfMonth(today), 5);
        const sixMonthsAgoTimestamp = Timestamp.fromDate(sixMonthsAgo);

        const q = query(
          expensesCol,
          where("date", ">=", sixMonthsAgoTimestamp),
          orderBy("date", "asc")
        );

        const snapshot = await getDocs(q);
        const trendExpenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date instanceof Timestamp ? doc.data().date.toDate() : new Date(doc.data().date),
          categoryId: doc.data().categoryId,
          locationId: doc.data().locationId,
          amount: Number(doc.data().amount) || 0
        }));

        // Process trend data
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
        const months = Object.keys(monthlyTotals).sort((a, b) => {
          const [yearA, monthA] = a.split('-').map(Number);
          const [yearB, monthB] = b.split('-').map(Number);
          return yearA !== yearB ? yearA - yearB : monthA - monthB;
        });

        // Create arrays for chart data
        const totals = months.map(month => monthlyTotals[month] || 0);

        // Create category and location data
        const categoryData: Record<string, number[]> = {};
        const locationData: Record<string, number[]> = {};

        // For each category, create an array of values for each month
        Object.keys(categoryMonthly).forEach(categoryId => {
          const category = categories.find(c => c.id === categoryId);
          if (category) {
            categoryData[category.name] = months.map(month => categoryMonthly[categoryId][month] || 0);
          }
        });

        // For each location, create an array of values for each month
        Object.keys(locationMonthly).forEach(locationId => {
          const location = locations.find(l => l.id === locationId);
          if (location) {
            locationData[location.name] = months.map(month => locationMonthly[locationId][month] || 0);
          }
        });

        setTrendData({ months, totals, categoryData, locationData });
        setTrendDataLoading(false);
      } catch (error) {
        console.error("Error fetching trend data:", error);
        setTrendDataLoading(false);
      }
    };

    fetchTrendData();
  }, [currentUser, categories, locations]);

  // Calculate summary from expenses
  const calculateSummary = useCallback((expenseList: ExpenseWithDetails[]) => {
    console.log(`Calculating summary for ${expenseList.length} expenses`);

    // Return null if data isn't ready
    if (!currentUser || users.length < 2 || categories.length === 0 || locations.length === 0) {
      console.log('Missing required data for summary calculation');
      setSummary(null);
      return;
    }

    const user1 = users.find(u => u.id === currentUser.uid);
    const user2 = users.find(u => u.id !== currentUser.uid);

    if (!user1 || !user2) {
      console.log('Could not find both users for summary calculation');
      setSummary(null);
      return;
    }

    // Initialize counters
    let totalExpenses = 0;
    let totalSplitExpenses = 0;
    const userExpenses: Record<string, number> = { [user1.id]: 0, [user2.id]: 0 };
    let user1_paid_50_50 = 0;
    let user1_paid_100_owed_by_other = 0; // User1 paid, User2 owes User1
    let user2_paid_100_owed_by_other = 0; // User2 paid, User1 owes User2

    // Process each expense
    expenseList.forEach(exp => {
      const amount = Number(exp.amount) || 0;
      totalExpenses += amount; // Calculate total overall expenses

      // Track who paid what
      if (exp.paidByUserId === user1.id) userExpenses[user1.id] += amount;
      else if (exp.paidByUserId === user2.id) userExpenses[user2.id] += amount;

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
    });

    const fairShare = totalSplitExpenses / 2;

    // Calculate User1's balance
    // For 50/50 expenses: what User1 paid minus their fair share
    // For 100% expenses: add what User1 paid that User2 owes, subtract what User2 paid that User1 owes
    const user1Balance = user1_paid_50_50 - fairShare + user1_paid_100_owed_by_other - user2_paid_100_owed_by_other;
    console.log('User1 Balance:', user1Balance);

    // Calculate settlement amount (always positive) and direction
    let settlementAmount = 0;
    let settlementDirection = { fromUserId: "", toUserId: "" };

    // Use a small threshold to avoid floating point issues near zero
    const threshold = 0.005;
    if (user1Balance < -threshold) { // User1 owes User2
      settlementAmount = Math.abs(user1Balance);
      settlementDirection = { fromUserId: user1.id, toUserId: user2.id };
    } else if (user1Balance > threshold) { // User2 owes User1
      settlementAmount = user1Balance;
      settlementDirection = { fromUserId: user2.id, toUserId: user1.id };
    }

    // Calculate category and location totals
    const categoryTotalsMap = calculateCategoryTotals(expenseList);
    const locationTotalsMap = calculateLocationTotals(expenseList);

    // Convert category totals to array with percentages
    const categoryTotals = Object.entries(categoryTotalsMap).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId) || {
        id: categoryId,
        name: 'Unknown Category',
        color: '#888888'
      };
      return {
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    // Convert location totals to array with percentages
    const locationTotals = Object.entries(locationTotalsMap).map(([locationId, amount]) => {
      const location = locations.find(l => l.id === locationId) || {
        id: locationId,
        name: 'Unknown Location'
      };
      return {
        location,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    const newSummary = {
      month: currentMonth,
      totalExpenses,
      userExpenses,
      settlementAmount,
      settlementDirection,
      categoryTotals,
      locationTotals
    };

    console.log('Setting new summary:', newSummary);
    setSummary(newSummary);
  }, [currentUser, users, categories, locations, currentMonth]);

  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Helper function to get username by ID
  const getUsernameById = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.username || user?.email?.split('@')[0] || 'Unknown User';
  };

  // Function to add a test expense
  const addTestExpense = async () => {
    try {
      if (!currentUser || categories.length === 0 || locations.length === 0) {
        toast({
          title: "Cannot add test expense",
          description: "Missing required data (user, categories, or locations).",
          variant: "destructive"
        });
        return;
      }

      // Get the first category and location
      const categoryId = categories[0]?.id;
      const locationId = locations[0]?.id;

      if (categoryId && locationId) {
        // Add a test expense
        await addDoc(collection(db, "expenses"), {
          amount: 100,
          categoryId,
          locationId,
          date: new Date(),
          description: "Test expense",
          month: currentMonth,
          paidByUserId: currentUser.uid,
          splitType: "50/50"
        });

        toast({
          title: "Test expense added",
          description: "A test expense has been added for the current month."
        });
      }
    } catch (error) {
      console.error('Error adding test expense:', error);
      toast({
        title: "Error",
        description: "Failed to add test expense.",
        variant: "destructive"
      });
    }
  };

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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <MonthSelector
              value={currentMonth}
              onChange={handleMonthChange}
            />
          </div>
        </div>

        {/* Summary Card */}
        <Card className="overflow-hidden border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4"><CardTitle className="text-xl">Monthly Summary</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-24 w-full" /> : (
              summary ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary mt-2">{formatCurrency(summary.totalExpenses)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Settlement: <span className="font-medium">{formatCurrency(summary.settlementAmount)}</span></p>
                </div>
              ) : (
                <div className="p-8 text-center"><p className="text-gray-600 dark:text-gray-400">No summary data available for this month.</p></div>
              )
            )}
          </CardContent>
        </Card>

        {/* Comparison Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* User comparison chart */}
          <div>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : summary && Object.keys(summary.userExpenses).length > 0 ? (
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <PieChart
                    title="User Expense Comparison"
                    data={Object.entries(summary.userExpenses).map(([userId, amount]) => ({
                      name: getUsernameById(userId),
                      value: amount,
                    }))}
                    valueFormatter={formatCurrency}
                    customColorFunction={getUserColor}
                    totalLabel="Total"
                  />
                </TabsContent>
                <TabsContent value="table">
                  <SimpleDataTable
                    title="User Expense Comparison"
                    data={Object.entries(summary.userExpenses).map(([userId, amount]) => ({
                      name: getUsernameById(userId),
                      value: amount,
                    }))}
                    valueFormatter={formatCurrency}
                    customColorFunction={getUserColor}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="border-gray-200 dark:border-gray-700 h-full">
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
          </div>

          {/* Category Chart */}
          <div>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : summary && summary.categoryTotals && summary.categoryTotals.length > 0 ? (
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <PieChart
                    title="Expenses by Category"
                    data={summary.categoryTotals.map(item => ({
                      name: item.category.name,
                      value: item.amount,
                      percentage: item.percentage,
                    }))}
                    valueFormatter={formatCurrency}
                    customColorFunction={getCategoryColor}
                    totalLabel="Total"
                  />
                </TabsContent>
                <TabsContent value="table">
                  <SimpleDataTable
                    title="Expenses by Category"
                    data={summary.categoryTotals.map(item => ({
                      name: item.category.name,
                      value: item.amount,
                      percentage: item.percentage,
                    }))}
                    valueFormatter={formatCurrency}
                    customColorFunction={getCategoryColor}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="border-gray-200 dark:border-gray-700 h-full">
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
          </div>

          {/* Location Chart */}
          <div>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : summary && summary.locationTotals && summary.locationTotals.length > 0 ? (
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <TabsContent value="chart">
                  <PieChart
                    title="Expenses by Location"
                    data={summary.locationTotals.map(item => ({
                      name: item.location.name,
                      value: item.amount,
                      percentage: item.percentage,
                    }))}
                    valueFormatter={formatCurrency}
                    customColorFunction={getLocationColor}
                    totalLabel="Total"
                  />
                </TabsContent>
                <TabsContent value="table">
                  <SimpleDataTable
                    title="Expenses by Location"
                    data={summary.locationTotals.map(item => ({
                      name: item.location.name,
                      value: item.amount,
                      percentage: item.percentage,
                    }))}
                    valueFormatter={formatCurrency}
                    customColorFunction={getLocationColor}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="border-gray-200 dark:border-gray-700 h-full">
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
          </div>
        </div>

        {/* Trend Chart - Full Width */}
        {isLoading || trendDataLoading ? (
          <Skeleton className="h-[400px] w-full" />
        ) : trendData && trendData.months && trendData.months.length > 0 ? (
          <div className="w-full">
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chart">Chart</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              <TabsContent value="chart">
                <LineChart
                  trendData={trendData}
                  isLoading={false}
                />
              </TabsContent>
              <TabsContent value="table">
                <SimpleTrendChart
                  trendData={trendData}
                  isLoading={false}
                />
              </TabsContent>
            </Tabs>
          </div>
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
    </MainLayout>
  );
}
