import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useExpenseStore } from '../store/expenseStore';
import { ChevronDown, ChevronUp, Filter, Clock, DollarSign } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);

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
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">Settlement History</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors sm:hidden min-h-[48px]"
          >
            <Filter className="w-5 h-5" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>

        {/* Controls for mobile and desktop */}
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${!showFilters && 'hidden sm:flex'}`}>
          {/* Sort Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSort('date')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg min-h-[48px] min-w-[120px] ${
                sortField === 'date' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Date</span>
              {sortField === 'date' && (
                sortOrder === 'desc' ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => handleSort('amount')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg min-h-[48px] min-w-[120px] ${
                sortField === 'amount' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Amount</span>
              {sortField === 'amount' && (
                sortOrder === 'desc' ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filters.categoryGroup || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, categoryGroup: e.target.value || undefined }))}
              className="px-4 py-3 border rounded-lg text-base min-h-[48px] bg-white"
            >
              <option value="">All Groups</option>
              {categoryGroups.map(group => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <select
              value={filters.user || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value || undefined }))}
              className="px-4 py-3 border rounded-lg text-base min-h-[48px] bg-white"
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
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div>
                  <p className="font-medium text-base">
                    {format(new Date(settlement.settledAt), 'dd MMM yyyy, HH:mm')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Settled by {settlement.settledBy}
                  </p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p className={`font-medium text-base ${getBalanceColor(settlement.balance)}`}>
                    £{Math.abs(settlement.balance).toFixed(2)}
                  </p>
                  <p className={`text-sm ${getBalanceColor(settlement.balance)} mt-1`}>
                    {formatBalance(settlement.balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Settlement Details */}
            {selectedSettlement === settlement.id && (
              <div className="border-t p-4 bg-gray-50">
                <h4 className="font-medium mb-4">Category Groups</h4>
                <div className="space-y-3">
                  {settlement.categoryGroups.map(group => {
                    const categoryGroup = categoryGroups.find(g => g.id === group.groupId);
                    return (
                      <div key={group.groupId} className="flex justify-between items-center text-base">
                        <span className="mr-4">{categoryGroup?.name || 'Unknown Group'}</span>
                        <span className="font-medium whitespace-nowrap">£{Math.abs(group.amount).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                {settlement.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Notes</h4>
                    <p className="text-base text-gray-600">{settlement.notes}</p>
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
