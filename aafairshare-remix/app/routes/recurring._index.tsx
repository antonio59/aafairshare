import { useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';
import { useAuth } from '~/contexts/AuthContext';
import MainLayout from '~/components/layouts/MainLayout';
import { Button } from '~/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog';
import RecurringExpenseForm from '~/components/RecurringExpenseForm';
import RecurringExpenseList from '~/components/RecurringExpenseList';
import { RecurringExpenseWithDetails, Category, Location, User } from '~/shared/schema';
import { db } from '~/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function Recurring() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecurringExpense, setSelectedRecurringExpense] = useState<RecurringExpenseWithDetails | null>(null);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  // Fetch data when component mounts
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesQuery = query(collection(db, 'categories'), orderBy('name'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);

        // Fetch locations
        const locationsQuery = query(collection(db, 'locations'), orderBy('name'));
        const locationsSnapshot = await getDocs(locationsQuery);
        const locationsData = locationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Location[];
        setLocations(locationsData);

        // Fetch users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        setUsers(usersData);

        // Fetch recurring expenses
        const recurringExpensesQuery = query(collection(db, 'recurringExpenses'), orderBy('startDate', 'desc'));
        const recurringExpensesSnapshot = await getDocs(recurringExpensesQuery);
        const recurringExpensesData = recurringExpensesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            category: categoriesData.find(c => c.id === data.categoryId),
            location: locationsData.find(l => l.id === data.locationId),
            paidByUser: usersData.find(u => u.id === data.paidByUserId)
          };
        }) as RecurringExpenseWithDetails[];
        setRecurringExpenses(recurringExpensesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleAddRecurringExpense = () => {
    setSelectedRecurringExpense(null);
    setIsFormOpen(true);
  };

  const handleEditRecurringExpense = (recurringExpense: RecurringExpenseWithDetails) => {
    setSelectedRecurringExpense(recurringExpense);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRecurringExpense(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedRecurringExpense(null);

    // Refetch data
    if (currentUser) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch recurring expenses
          const recurringExpensesQuery = query(collection(db, 'recurringExpenses'), orderBy('startDate', 'desc'));
          const recurringExpensesSnapshot = await getDocs(recurringExpensesQuery);
          const recurringExpensesData = recurringExpensesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              category: categories.find(c => c.id === data.categoryId),
              location: locations.find(l => l.id === data.locationId),
              paidByUser: users.find(u => u.id === data.paidByUserId)
            };
          }) as RecurringExpenseWithDetails[];
          setRecurringExpenses(recurringExpensesData);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  };

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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recurring Expenses</h1>
          <Button onClick={handleAddRecurringExpense}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Recurring Expense
          </Button>
        </div>

        <RecurringExpenseList
          recurringExpenses={recurringExpenses}
          onEdit={handleEditRecurringExpense}
          isLoading={isLoading}
        />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedRecurringExpense ? 'Edit Recurring Expense' : 'Add Recurring Expense'}</DialogTitle>
              <DialogDescription>
                {selectedRecurringExpense ? 'Update the recurring expense details below.' : 'Enter the recurring expense details below.'}
              </DialogDescription>
            </DialogHeader>
            <RecurringExpenseForm
              recurringExpense={selectedRecurringExpense || undefined}
              categories={categories}
              locations={locations}
              users={users}
              currentUserId={currentUser?.uid || ''}
              onSuccess={handleFormSuccess}
              onCancel={handleFormClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
