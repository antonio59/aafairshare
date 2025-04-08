import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { RecurringExpenseList } from "@/components/RecurringExpenseList";
import RecurringExpenseForm from "@/components/RecurringExpenseForm";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { RecurringExpenseWithDetails, Category, Location, User } from "@shared/schema";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RecurringExpensesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<RecurringExpenseWithDetails | null>(null);

  // Fetch recurring expenses
  const {
    data: recurringExpenses = [],
    isLoading: recurringExpensesLoading,
    refetch: refetchRecurringExpenses,
  } = useQuery({
    queryKey: ["recurringExpenses"],
    queryFn: async () => {
      if (!currentUser) return [];

      try {
        const q = query(
          collection(db, "recurringExpenses"),
          orderBy("startDate", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as RecurringExpenseWithDetails[];
      } catch (error) {
        console.error("Error fetching recurring expenses:", error);
        toast({
          title: "Error",
          description: "Failed to load recurring expenses",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!currentUser,
  });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Fetch locations
  const {
    data: locations = [],
    isLoading: locationsLoading,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "locations"));
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Location[];
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast({
          title: "Error",
          description: "Failed to load locations",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Fetch users
  const {
    data: users = [],
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const handleCreateSuccess = () => {
    setShowForm(false);
    setSelectedRecurringExpense(null);
    refetchRecurringExpenses();
  };

  const handleEditRecurringExpense = (recurringExpense: RecurringExpenseWithDetails) => {
    setSelectedRecurringExpense(recurringExpense);
    setShowForm(true);
  };

  const isLoading = recurringExpensesLoading || categoriesLoading || locationsLoading || usersLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring Expenses</h1>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Recurring Expense
        </Button>
      </div>

      {showForm ? (
        <RecurringExpenseForm
          onSuccess={handleCreateSuccess}
          onCancel={() => {
            setShowForm(false);
            setSelectedRecurringExpense(null);
          }}
          initialData={selectedRecurringExpense || undefined}
          categories={categories}
          locations={locations}
          users={users}
        />
      ) : (
        <RecurringExpenseList
          recurringExpenses={recurringExpenses}
          onEdit={handleEditRecurringExpense}
          isLoading={isLoading}
          categories={categories}
          locations={locations}
          users={users}
        />
      )}
    </div>
  );
}
