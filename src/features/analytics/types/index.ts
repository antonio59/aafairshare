/**
 * Analytics Types
 * 
 * This file contains all the type definitions for the analytics feature.
 */

/**
 * Represents a data point for category distribution.
 */
export interface CategoryData {
  /** The name of the expense category */
  category: string;
  /** The total amount spent in this category */
  amount: number;
}

/**
 * Represents a data point for location spending.
 */
export interface LocationData {
  /** The location name where expenses occurred */
  location: string;
  /** The total amount spent at this location */
  amount: number;
}

/**
 * Represents a data point for time-based spending distribution.
 */
export interface TimeData {
  /** The time period (Morning, Afternoon, Evening) */
  period: string;
  /** The total amount spent during this period */
  amount: number;
}

/**
 * Represents a single data point for daily expense trends.
 */
export interface DailyTrendData {
  /** The date in ISO format (YYYY-MM-DD) */
  date: string;
  /** The total amount spent on this date */
  amount: number;
}

/**
 * Contains data for expense trends over time.
 */
export interface TrendData {
  /** Collection of daily expense data points */
  daily: DailyTrendData[];
}

/**
 * Represents the status of budget relative to target.
 */
export interface BudgetStatus {
  /** Current spending amount */
  current: number;
  /** Target budget amount */
  target: number;
  /** Status assessment based on spending compared to budget */
  status: 'on_track' | 'warning' | 'at_risk';
}

/**
 * Represents the complete response from expense analytics API.
 */
export interface AnalyticsResponse {
  /** Distribution of expenses by category */
  categoryDistribution: CategoryData[];
  /** Distribution of expenses by location */
  locationDistribution: LocationData[];
  /** Daily expense trend data */
  dailyTrend: DailyTrendData[];
  /** Distribution of expenses by time of day */
  timeDistribution: TimeData[];
  /** Total amount spent in the analyzed period */
  totalSpent: number;
  /** Total number of expenses in the analyzed period */
  count: number;
}

/**
 * Date range options for analytics queries.
 */
export type DateRangeOption = 'month' | 'quarter' | 'year' | 'custom';

/**
 * Props for analytics charts and visualizations.
 */
export interface AnalyticsChartProps {
  /** Data to be displayed in the chart */
  data: any;
  /** Optional title for the chart */
  title?: string;
  /** Whether the chart is in a loading state */
  loading?: boolean;
  /** Error message to display if there was an error loading data */
  error?: string | null;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Budget settings for a user.
 */
export interface BudgetSettings {
  /** Monthly budget target amount */
  monthlyTarget: number;
  /** Whether to show budget warnings */
  showWarnings: boolean;
  /** Warning threshold as a percentage of budget (e.g., 80 means warn at 80% of budget) */
  warningThreshold: number;
} 