'use client';

import { CalendarIcon, Download, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { createStandardBrowserClient } from '@/utils/supabase-client';

interface Expense {
  id: string;
  amount: number;
  date: string;
  notes: string;
  category_id?: string | null;
  category?: {
    name: string;
    color?: string;
  } | null;
  categories?: {
    name: string;
    color?: string;
  } | null;
}

interface ExpensesDashboardWrapperProps {
  initialMonth?: string;
}

export function ExpensesDashboardWrapper({ initialMonth }: ExpensesDashboardWrapperProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date().toISOString().slice(0, 7));

  useEffect(() => {
    async function fetchExpenses() {
      setIsLoading(true);
      try {
        const supabase = createStandardBrowserClient();
        
        // Get first and last day of the month
        const startDate = `${currentMonth}-01`;
        // Ensure currentMonth is defined before splitting
        const endDate = currentMonth ? new Date(
          parseInt(currentMonth.split('-')[0] || '0'), 
          parseInt(currentMonth.split('-')[1] || '0'), 
          0
        ).toISOString().slice(0, 10) : '';
        
        const { data, error } = await supabase
          .from('expenses')
          .select(`
            id,
            amount,
            date,
            notes,
            category_id,
            categories:category_id (name, color)
          `)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        // Transform data to match desired structure
        const formattedExpenses = data.map(expense => ({
          ...expense,
          category: expense.categories || null
        })) as Expense[];
        
        setExpenses(formattedExpenses);
        setFilteredExpenses(formattedExpenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        toast({
          title: 'Error loading expenses',
          description: 'There was a problem loading your expense data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchExpenses();
  }, [currentMonth, toast]);
  
  // Filter expenses when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExpenses(expenses);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = expenses.filter(expense => 
      expense.notes?.toLowerCase().includes(lowercaseQuery) ||
      expense.category?.name?.toLowerCase().includes(lowercaseQuery) ||
      expense.amount.toString().includes(lowercaseQuery)
    );
    
    setFilteredExpenses(filtered);
  }, [searchQuery, expenses]);
  
  // Handle month change
  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = event.target.value;
    setCurrentMonth(newMonth);
    router.push(`/expenses?month=${newMonth}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <input
            type="month"
            value={currentMonth}
            onChange={handleMonthChange}
            className="border-0 px-2 py-1.5 text-sm font-medium bg-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search expenses..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="icon" title="Export expenses">
            <Download className="h-4 w-4" />
          </Button>
          
          <Button asChild>
            <Link href="/expenses/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            Your expenses for {new Date(currentMonth + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredExpenses.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-5">Description</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              
              <div className="divide-y">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/20">
                    <div className="col-span-5 font-medium text-sm">
                      <Link href={`/expenses/${expense.id}`} className="hover:underline">
                        {expense.notes || 'Unnamed expense'}
                      </Link>
                    </div>
                    <div className="col-span-3">
                      {expense.category ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: expense.category.color || '#9ca3af' }}
                          />
                          <span className="text-sm">{expense.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Uncategorized</span>
                      )}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                    <div className="col-span-2 font-medium text-right">
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No expenses found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {searchQuery ? 'Try adjusting your search term' : `No expenses for ${new Date(currentMonth + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`}
              </p>
              <Button asChild variant="outline">
                <Link href="/expenses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add a new expense
                </Link>
              </Button>
            </div>
          )}
          
          {filteredExpenses.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div>
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </div>
              <div className="font-medium">
                Total: ${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
