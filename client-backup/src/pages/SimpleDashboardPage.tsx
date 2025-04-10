import React, { useState, useEffect } from "react";
import MonthSelector from "@/components/MonthSelector";
import SimpleDashboard from "@/components/SimpleDashboard";
import { MonthSummary, Expense } from "@shared/schema";
import { getCurrentMonth } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, Timestamp, getDocs } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";

export default function SimpleDashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState<MonthSummary | undefined>(undefined);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  // Function to fetch data
  const fetchData = async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Parse the month string (YYYY-MM) to get start and end dates
      const [year, month] = currentMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month

      // Convert to Firestore Timestamps
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      // Fetch expenses for the current month
      const expensesQuery = query(
        collection(db, "expenses"),
        // Remove householdId filter as it's not in the schema
        where("date", ">=", startTimestamp),
        where("date", "<=", endTimestamp),
        orderBy("date", "desc")
      );

      const expensesSnapshot = await getDocs(expensesQuery);
      const expensesData = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expensesData);

      // Fetch summary for the current month
      const summaryQuery = query(
        collection(db, "summaries"),
        // Remove householdId filter as it's not in the schema
        where("month", "==", currentMonth)
      );

      const summarySnapshot = await getDocs(summaryQuery);
      if (!summarySnapshot.empty) {
        // Convert to MonthSummary with proper type handling
        const summaryDoc = summarySnapshot.docs[0];
        const summaryData = {
          id: summaryDoc.id,
          month: summaryDoc.data().month || currentMonth,
          totalExpenses: summaryDoc.data().totalExpenses || 0,
          userExpenses: summaryDoc.data().userExpenses || {},
          settlementAmount: summaryDoc.data().settlementAmount || 0,
          settlementDirection: summaryDoc.data().settlementDirection || { fromUserId: "", toUserId: "" },
          categoryTotals: summaryDoc.data().categoryTotals || [],
          locationTotals: summaryDoc.data().locationTotals || [],
          splitTypeTotals: summaryDoc.data().splitTypeTotals || {},
          dateDistribution: summaryDoc.data().dateDistribution || {}
        } as MonthSummary;
        setSummary(summaryData);
      } else {
        setSummary(undefined);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the component mounts or when the current month changes
  useEffect(() => {
    fetchData();
  }, [currentUser, currentMonth]);

  // Handle month change
  const handleMonthChange = (month: string) => {
    setCurrentMonth(month);
  };

  // Show message if not logged in
  if (!currentUser && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card>
          <CardContent className="p-6">
            <p className="text-lg text-gray-600 dark:text-gray-400">Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 md:px-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <MonthSelector
            value={currentMonth}
            onChange={handleMonthChange}
          />
        </div>
      </div>

      <SimpleDashboard
        summary={summary}
        expenses={expenses}
        isLoading={isLoading}
        currentMonth={currentMonth}
      />
    </div>
  );
}
