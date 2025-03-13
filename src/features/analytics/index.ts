/**
 * Analytics Feature
 * 
 * This module provides analytics visualization and data processing for expense tracking.
 */

// Export analytics components
export { default as AnalyticsPage } from './components/AnalyticsPage';
export { default as Dashboard } from './components/Dashboard';
export { CategoryDistributionChart } from './components/CategoryDistributionChart';
export { ExpenseTrendChart } from './components/ExpenseTrendChart';
export { LocationSpendingChart } from './components/LocationSpendingChart';
export { BudgetSettingsModal } from './components/BudgetSettingsModal';

// Export analytics API
export {
  fetchExpenseAnalytics,
  calculateBudgetStatus,
  clearAnalyticsCache,
  getTopSpendingCategories,
  getTopSpendingLocations,
  getSpendingTrends
} from './api/analyticsApi';

export {
  getUserBudget,
  saveBudgetSettings
} from './api/budgetApi';

// Export types
export * from './types'; 