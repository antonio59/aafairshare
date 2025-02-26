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

interface DateRange {
  start?: Date;
  end?: Date;
}

const SettlementHistory = () => {
  const { settlements, categoryGroups } = useExpenseStore();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Helper functions
  function formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd MMM yyyy');
  }

  function formatCurrency(amount: number | undefined): string {
    if (amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Helper function to safely access categoryGroups
  function getCategoryGroupName(settlement: any, groupId: string): string {
    if (!settlement.categoryGroups) return 'Unknown Group';
    const categoryGroup = settlement.categoryGroups.find((cg: any) => cg.groupId === groupId);
    return categoryGroup?.name || 'Unknown Group';
  }

  // Format balance for display
  function formatBalance(balance: number | undefined): string {
    if (balance === undefined) return '';
    if (balance === 0) return 'Settled';
    return balance > 0 ? 'You are owed' : 'You owe';
  }

  // Get color based on balance
  function getBalanceColor(balance: number | undefined): string {
    if (balance === undefined) return '';
    if (balance === 0) return 'text-gray-500';
    return balance > 0 ? 'text-green-600' : 'text-red-600';
  }

  // Sort settlements
  const sortedSettlements = useMemo(() => {
    return [...settlements].sort((a, b) => {
      // If dates are available, sort by date
      if (a.settledAt && b.settledAt) {
        return new Date(b.settledAt).getTime() - new Date(a.settledAt).getTime();
      }
      
      // Fallback to sorting by month
      if (a.month && b.month) {
        return a.month > b.month ? -1 : 1;
      }
      
      return 0;
    });
  }, [settlements]);

  // Filter settlements
  const filteredSettlements = useMemo(() => {
    return sortedSettlements.filter(settlement => {
      // Filter by date range
      if (dateRange.start && dateRange.end) {
        const settlementDate = settlement.settledAt ? new Date(settlement.settledAt) : null;
        if (settlementDate && (settlementDate < dateRange.start || settlementDate > dateRange.end)) {
          return false;
        }
      }
      
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSettledBy = settlement.settledBy ? settlement.settledBy.toLowerCase().includes(searchLower) : false;
        
        // Safely check categoryGroups
        const matchesCategoryGroup = settlement.categoryGroups ? 
          settlement.categoryGroups.some(group => 
            categoryGroups.find(cg => cg.id === group.groupId)?.name.toLowerCase().includes(searchLower)
          ) : false;
          
        return matchesSettledBy || matchesCategoryGroup;
      }
      
      // Filter by category group
      if (filters.categoryGroup) {
        const hasGroup = settlement.categoryGroups ? settlement.categoryGroups.some(
          group => group.groupId === filters.categoryGroup
        ) : false;
        if (!hasGroup) return false;
      }
      
      // Filter by user
      if (filters.user && settlement.settledBy) {
        if (settlement.settledBy !== filters.user) {
          return false;
        }
      }
      
      return true;
    });
  }, [sortedSettlements, dateRange, searchTerm, categoryGroups, filters]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
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
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="px-4 py-3 border rounded-lg text-base min-h-[48px] bg-white"
            />
          </div>
        </div>
      </div>

      {/* Settlements List */}
      <div className="mt-6 space-y-6">
        {filteredSettlements.map(settlement => (
          <div 
            key={settlement.id} 
            className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all ${
              selectedSettlement === settlement.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedSettlement(
              selectedSettlement === settlement.id ? null : settlement.id
            )}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div>
                <p className="font-medium text-base">
                  {formatDate(settlement.settledAt)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Settled by {settlement.settledBy}
                </p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <p className={`font-medium text-base ${getBalanceColor(settlement.balance)}`}>
                  {formatCurrency(settlement.balance)}
                </p>
                <p className={`text-sm ${getBalanceColor(settlement.balance)} mt-1`}>
                  {formatBalance(settlement.balance)}
                </p>
              </div>
            </div>
            
            {selectedSettlement === settlement.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-4">Category Groups</h4>
                <div className="space-y-3">
                  {settlement.categoryGroups && settlement.categoryGroups.map(group => {
                    const categoryGroupName = getCategoryGroupName(settlement, group.groupId);
                    return (
                      <div key={group.groupId} className="flex justify-between items-center text-base">
                        <span className="mr-4">{categoryGroupName}</span>
                        <span className="font-medium whitespace-nowrap">{formatCurrency(group.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredSettlements.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No settlements found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementHistory;
