import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useExpenseStore } from '../store/expenseStore';
import { ChevronDown, ChevronUp, Filter, Clock, User, DollarSign, Folder } from 'lucide-react';

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  categoryGroup?: string;
  user?: string;
}

const SettlementHistory = () => {
  const { settlements, categoryGroups } = useExpenseStore();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null);

  // Sort settlements
  const sortedSettlements = useMemo(() => {
    return [...settlements].sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime()
          : new Date(a.settledAt).getTime() - new Date(b.settledAt).getTime();
      } else {
        return sortOrder === 'desc'
          ? Math.abs(b.balance) - Math.abs(a.balance)
          : Math.abs(a.balance) - Math.abs(b.balance);
      }
    });
  }, [settlements, sortField, sortOrder]);

  // Filter settlements
  const filteredSettlements = useMemo(() => {
    return sortedSettlements.filter(settlement => {
      if (filters.categoryGroup) {
        const hasGroup = settlement.categoryGroups.some(
          group => group.groupId === filters.categoryGroup
        );
        if (!hasGroup) return false;
      }
      if (filters.user && settlement.settledBy !== filters.user) {
        return false;
      }
      return true;
    });
  }, [sortedSettlements, filters]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const formatBalance = (amount: number) => {
    const absAmount = Math.abs(amount);
    if (amount > 0) {
      return `Antonio owes Andres £${absAmount.toFixed(2)}`;
    } else if (amount < 0) {
      return `Andres owes Antonio £${absAmount.toFixed(2)}`;
    }
    return 'No balance';
  };

  const getBalanceColor = (amount: number) => {
    if (amount === 0) return 'text-gray-600';
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Settlement History</h2>
        <div className="flex gap-4">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSort('date')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                sortField === 'date' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              Date
              {sortField === 'date' && (
                sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => handleSort('amount')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded ${
                sortField === 'amount' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Amount
              {sortField === 'amount' && (
                sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <select
              value={filters.categoryGroup || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryGroup: e.target.value || undefined }))}
              className="px-3 py-1.5 border rounded text-sm"
            >
              <option value="">All Groups</option>
              {categoryGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <select
              value={filters.user || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value || undefined }))}
              className="px-3 py-1.5 border rounded text-sm"
            >
              <option value="">All Users</option>
              <option value="Andres">Andres</option>
              <option value="Antonio">Antonio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Settlements List */}
      <div className="space-y-4">
        {filteredSettlements.map(settlement => (
          <div key={settlement.id} className="border rounded-lg">
            {/* Settlement Header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedSettlement(
                selectedSettlement === settlement.id ? null : settlement.id
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {format(new Date(settlement.settledAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Settled by {settlement.settledBy}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getBalanceColor(settlement.balance)}`}>
                    £{Math.abs(settlement.balance).toFixed(2)}
                  </p>
                  <p className={`text-sm ${getBalanceColor(settlement.balance)}`}>
                    {formatBalance(settlement.balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Settlement Details */}
            {selectedSettlement === settlement.id && (
              <div className="border-t p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Category Groups</h4>
                <div className="space-y-2">
                  {settlement.categoryGroups.map(group => {
                    const categoryGroup = categoryGroups.find(g => g.id === group.groupId);
                    return (
                      <div key={group.groupId} className="flex justify-between items-center text-sm">
                        <span>{categoryGroup?.name || 'Unknown Group'}</span>
                        <span className="font-medium">£{Math.abs(group.amount).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                {settlement.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{settlement.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredSettlements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No settlements found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementHistory;
