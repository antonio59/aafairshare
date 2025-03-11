/**
 * Worker Manager
 * 
 * This utility provides a convenient API for using the expense calculation
 * Web Worker, handling worker creation and message passing.
 */

// Keep track of the worker instance
let worker: Worker | null = null;

// Initialize the worker when needed
function getWorker(): Worker {
  if (worker === null) {
    worker = new Worker(new URL('./expense-calculations.worker.ts', import.meta.url), { type: 'module' });
  }
  return worker;
}

/**
 * Calculate monthly totals using the Web Worker
 * @param expenses - Array of expense objects
 * @returns Promise resolving to a record of monthly totals
 */
export function calculateMonthlyTotals(expenses: any[]): Promise<Record<string, number>> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    
    const messageHandler = (event: MessageEvent) => {
      if (event.data.action === 'CALCULATE_MONTHLY_TOTALS') {
        w.removeEventListener('message', messageHandler);
        
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      }
    };
    
    w.addEventListener('message', messageHandler);
    
    w.postMessage({
      action: 'CALCULATE_MONTHLY_TOTALS',
      payload: expenses
    });
  });
}

/**
 * Calculate statistics for expenses using the Web Worker
 * @param expenses - Array of expense objects
 * @returns Promise resolving to statistics object
 */
export function calculateStatistics(expenses: any[]): Promise<{
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
  byCategory: Record<string, number>;
  byMonth: Record<string, number>;
}> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    
    const messageHandler = (event: MessageEvent) => {
      if (event.data.action === 'CALCULATE_STATISTICS') {
        w.removeEventListener('message', messageHandler);
        
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      }
    };
    
    w.addEventListener('message', messageHandler);
    
    w.postMessage({
      action: 'CALCULATE_STATISTICS',
      payload: expenses
    });
  });
}

/**
 * Group expenses by date using the Web Worker
 * @param expenses - Array of expense objects
 * @returns Promise resolving to expenses grouped by date
 */
export function groupExpensesByDate(expenses: any[]): Promise<Record<string, any[]>> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    
    const messageHandler = (event: MessageEvent) => {
      if (event.data.action === 'GROUP_BY_DATE') {
        w.removeEventListener('message', messageHandler);
        
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      }
    };
    
    w.addEventListener('message', messageHandler);
    
    w.postMessage({
      action: 'GROUP_BY_DATE',
      payload: expenses
    });
  });
}

/**
 * Process analytics data for expenses using the Web Worker
 * @param expenses - Array of expense objects
 * @returns Promise resolving to processed analytics data
 */
export function processAnalyticsData(expenses: any[]): Promise<{
  categoryData: Array<{ category: string; amount: number }>;
  locationData: Array<{ location: string; amount: number }>;
  timeData: Array<{ period: string; amount: number }>;
  trendData: { daily: Array<{ date: string; amount: number }> };
  totalSpending: number;
  expenseCount: number;
}> {
  return new Promise((resolve, reject) => {
    const w = getWorker();
    
    const messageHandler = (event: MessageEvent) => {
      if (event.data.action === 'PROCESS_ANALYTICS') {
        w.removeEventListener('message', messageHandler);
        
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.result);
        }
      }
    };
    
    w.addEventListener('message', messageHandler);
    
    w.postMessage({
      action: 'PROCESS_ANALYTICS',
      payload: expenses
    });
  });
}

/**
 * Terminate the worker when it's no longer needed
 * Call this when cleaning up to free resources
 */
export function terminateWorker(): void {
  if (worker) {
    worker.terminate();
    worker = null;
  }
} 