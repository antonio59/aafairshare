'use client';

import { useState, useEffect } from 'react';
import { Dialog } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { format } from 'date-fns';
import type { Settlement, Expense } from '@/types';

interface SettlementSummary {
  id: string;
  date: string;
  amount: number;
  paidBy: string;
  paidTo: string;
  notes: string;
  status: 'pending' | 'completed';
  expenses: Expense[];
}

interface SettlementsData {
  settlements: SettlementSummary[];
  stats: {
    totalSettled: number;
    pendingAmount: number;
    balanceByPerson: Record<string, number>;
  };
  unsettledExpenses: Expense[];
  balances: {
    Andres: number;
    Antonio: number;
  };
}

export function SettlementsClient() {
  // State
  const [data, setData] = useState<SettlementsData | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementSummary | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data from server component
  useEffect(() => {
    const dataScript = document.getElementById('settlements-data');
    if (dataScript) {
      const settlementsData = JSON.parse(dataScript.innerHTML);
      setData(settlementsData);
    }
  }, []);

  if (!data) return null;

  const { settlements, stats, unsettledExpenses, balances } = data;

  // Calculate who should pay whom
  const calculateSettlementDirection = () => {
    if (balances.Andres > balances.Antonio) {
      return {
        paidBy: 'Antonio',
        paidTo: 'Andres',
        amount: balances.Andres - balances.Antonio,
      };
    } else {
      return {
        paidBy: 'Andres',
        paidTo: 'Antonio',
        amount: balances.Antonio - balances.Andres,
      };
    }
  };

  const settlement = calculateSettlementDirection();

  // Handlers
  const handleCreateSettlement = async () => {
    if (selectedExpenses.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          paidBy: settlement.paidBy,
          paidTo: settlement.paidTo,
          notes,
          expenseIds: selectedExpenses,
          status: 'pending',
        }),
      });

      if (!response.ok) throw new Error('Failed to create settlement');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to create settlement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSettlement = async (id: string) => {
    try {
      const response = await fetch(`/api/settlements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (!response.ok) throw new Error('Failed to complete settlement');

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to complete settlement:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Settled</h3>
          <p className="text-2xl font-bold mt-1">£{stats.totalSettled.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Pending Settlements</h3>
          <p className="text-2xl font-bold mt-1">£{stats.pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
          <div className="mt-1">
            <p className="text-sm">
              Andres: £{balances.Andres.toFixed(2)}
            </p>
            <p className="text-sm">
              Antonio: £{balances.Antonio.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'history')}>
        <TabsList>
          <TabsTrigger value="create">Create Settlement</TabsTrigger>
          <TabsTrigger value="history">Settlement History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Settlement Direction */}
          {settlement.amount > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Settlement Required</h3>
              <p className="text-gray-600">
                {settlement.paidBy} should pay {settlement.paidTo}:{' '}
                <span className="font-semibold">£{settlement.amount.toFixed(2)}</span>
              </p>
            </div>
          )}

          {/* Unsettled Expenses */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Unsettled Expenses</h3>
              <button
                onClick={handleCreateSettlement}
                disabled={selectedExpenses.length === 0 || isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Create Settlement
              </button>
            </div>

            <div className="space-y-4">
              {unsettledExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedExpenses.includes(expense.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExpenses([...selectedExpenses, expense.id]);
                      } else {
                        setSelectedExpenses(selectedExpenses.filter(id => id !== expense.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">£{expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Paid by {expense.paidBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Settlement History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Settlement History</h3>
            <div className="space-y-4">
              {settlements.map(settlement => (
                <div
                  key={settlement.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {settlement.paidBy} → {settlement.paidTo}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(settlement.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">£{settlement.amount.toFixed(2)}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          settlement.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {settlement.status}
                      </span>
                    </div>
                  </div>
                  {settlement.notes && (
                    <p className="text-sm text-gray-600 mt-2">{settlement.notes}</p>
                  )}
                  {settlement.status === 'pending' && (
                    <button
                      onClick={() => handleCompleteSettlement(settlement.id)}
                      className="mt-2 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Settlement Details Modal */}
      <Dialog 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setSelectedSettlement(null);
        }}
      >
        {/* Modal content */}
      </Dialog>
    </div>
  );
}
