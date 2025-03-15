/**
 * Task Handlers
 * 
 * This module contains handlers for background tasks that are processed by the task queue.
 * Each handler is responsible for executing a specific type of long-running operation.
 */

import { Task, TaskStatus, taskQueue } from './task-queue';
import { createLogger } from '@/core/utils/logger';
import { getExpenseAnalytics } from '@/features/expenses/api/expenseApi';
import { createSettlement } from '@/features/settlements/api/settlement-operations';
import { supabase } from '../core/api/supabase';
import { Database } from '@/core/types/supabase.types';

// Create a logger for this module
const logger = createLogger('TaskHandlers');

// Type definitions for database tables
type DbReports = Database['public']['Tables']['reports']['Insert'];
type DbExports = Database['public']['Tables']['exports']['Insert'];
type DbSettlements = Database['public']['Tables']['settlements']['Insert'];

// Analytics data type from getExpenseAnalytics
interface AnalyticsData {
  categoryData: Array<{category: string; amount: number}>;
  locationData: Array<{location: string; amount: number}>;
  timeData: Array<{period: string; amount: number}>;
  trendData: {
    daily: Array<{date: string; amount: number}>
  };
  totalSpending: number;
  expenseCount: number;
}

// Task types
export const TASK_TYPES = {
  GENERATE_REPORT: 'generate_report',
  CALCULATE_SETTLEMENTS: 'calculate_settlements',
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data'
};

/**
 * Initialize task handlers
 * This function registers all task handlers with the task queue
 */
export function initializeTaskHandlers(): void {
  // Register handlers
  taskQueue.registerHandler<ReportResult, ReportPayload>(TASK_TYPES.GENERATE_REPORT, handleReportGeneration);
  taskQueue.registerHandler<SettlementResult, SettlementPayload>(TASK_TYPES.CALCULATE_SETTLEMENTS, handleSettlementCalculation);
  taskQueue.registerHandler(TASK_TYPES.EXPORT_DATA, handleDataExport);
  taskQueue.registerHandler(TASK_TYPES.IMPORT_DATA, handleDataImport);
  
  logger.info('Task handlers initialized');
  
  // Set up periodic cleanup of old tasks
  setInterval(() => {
    taskQueue.cleanupOldTasks();
  }, 60 * 60 * 1000); // Run every hour
}

/**
 * Handler for report generation tasks
 */
interface ReportPayload {
  startDate: string;
  endDate: string;
  reportType: 'summary' | 'detailed';
}

interface ReportResult {
  reportId: string;
  title: string;
  generatedAt: string;
  totalExpenses: number;
  averageExpense: number;
  categories: Array<{category: string; amount: number}>;
  locations: Array<{location: string; amount: number}>;
  timeData: Array<{period: string; amount: number}>;
  reportData: {
    title: string;
    generatedAt: string;
    totalExpenses: number;
    averageExpense: number;
    categories: Array<{category: string; amount: number}>;
    locations: Array<{location: string; amount: number}>;
    timeData: Array<{period: string; amount: number}>;
  };
}

async function handleReportGeneration(task: Task<ReportResult, ReportPayload>): Promise<ReportResult> {
  const { startDate, endDate, reportType } = task.payload;
  
  logger.info(`Generating ${reportType} report for period ${startDate} to ${endDate}`);
  
  // Update progress
  taskQueue.updateTaskProgress(task.id, 10);
  
  try {
    // Get analytics data
    const analyticsData = await getExpenseAnalytics(startDate, endDate) as AnalyticsData;
    
    // Update progress
    taskQueue.updateTaskProgress(task.id, 50);
    
    // Process the data based on report type
    let reportData;
    
    switch (reportType) {
      case 'summary':
        reportData = {
          title: `Expense Summary Report (${startDate} to ${endDate})`,
          generatedAt: new Date().toISOString(),
          totalExpenses: analyticsData.totalSpending,
          averageExpense: analyticsData.expenseCount > 0 ? 
            analyticsData.totalSpending / analyticsData.expenseCount : 0,
          categories: analyticsData.categoryData,
          locations: analyticsData.locationData,
          timeData: analyticsData.timeData
        };
        break;
        
      case 'detailed':
        // Fetch detailed expense data
        const { data: expensesData } = await supabase<Expense[]>
          .from('expenses')
          .select(`
            *,
            categories(*),
            locations(*)
          `)
          .gte('date', startDate)
          .lte('date', endDate)
          .eq('paid_by', task.userId);
          
        reportData = {
          title: `Detailed Expense Report (${startDate} to ${endDate})`,
          generatedAt: new Date().toISOString(),
          totalExpenses: analyticsData.totalSpending,
          expenses: expensesData || [],
          summary: {
            categories: analyticsData.categoryData,
            trend: analyticsData.trendData
          }
        };
        break;
        
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
    
    // Update progress
    taskQueue.updateTaskProgress(task.id, 90);
    
    // Store the report in the database for later retrieval
    const reportInsertData: DbReports = {
      user_id: task.userId,
      report_type: reportType,
      start_date: startDate,
      end_date: endDate,
      report_data: reportData
    };
    
    const { data: reportRecord, error } = await supabase
      .from('reports')
      .insert(reportInsertData)
      .select('id')
      .single();
      
    if (error) {
      throw new Error(`Failed to store report: ${error.message}`);
    }
    
    if (!reportRecord) {
      throw new Error('Failed to create report record');
    }
    
    return {
      reportId: reportRecord.id,
      title: reportData.title,
      generatedAt: reportData.generatedAt,
      totalExpenses: reportData.totalExpenses,
      averageExpense: reportData.averageExpense,
      categories: reportData.categories,
      locations: reportData.locations,
      timeData: reportData.timeData,
      reportData
    };
  } catch (error) {
    logger.error('Error generating report:', error);
    throw error;
  }
}

/**
 * Handler for settlement calculation tasks
 */
interface SettlementResult {
  settlements: DbSettlements[];
  count: number;
}

interface SettlementPayload {
  expenseIds?: string[];
  groupId?: string;
  splitMethod: string;
}

async function handleSettlementCalculation(task: Task<SettlementResult, SettlementPayload>): Promise<SettlementResult> {
  const { expenseIds, groupId, splitMethod } = task.payload;
    const expenses = expenseIds;
  
  logger.info(`Calculating settlements for ${expenseIds ? expenseIds.length : 0} expenses`);
  
  // Update progress
  taskQueue.updateTaskProgress(task.id, 10);
  
  try {
    // Fetch expense data if IDs are provided
    let expenses: Expense[] = [];
    
    if (expenseIds && expenseIds.length > 0) {
      const { data } = await supabase<Expense[]>
        .from('expenses')
        .select(`
          *,
          users!inner(*),
          categories(*),
          locations(*)
        `)
        .in('id', expenseIds);
        
      expenses = data || [];
    } else if (groupId) {
      // Fetch expenses by group
      const { data } = await supabase<Expense[]>
        .from('expenses')
        .select(`
          *,
          users!inner(*),
          categories(*),
          locations(*)
        `)
        .eq('group_id', groupId);
        
      expenses = data || [];
    } else {
      throw new Error('Either expenseIds or groupId must be provided');
    }
    
    // Update progress
    taskQueue.updateTaskProgress(task.id, 30);
    
    // Calculate settlements
    const settlements: DbSettlements[] = [];
    
    // Simplified example of creating a settlement
    if (expenses.length > 0) {
      // For demonstration purposes, create a sample settlement
      const settlementData: DbSettlements = {
        user_id: task.userId,
        month_year: new Date().toISOString().slice(0, 7), // Format: YYYY-MM
        amount: expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0),
        status: 'pending'
      };
      
      try {
        const settlement = await createSettlement(settlementData);
        if (settlement) {
          settlements.push(settlement);
        }
      } catch (error) {
        logger.error('Error creating settlement:', error);
      }
    }
    
    // Update progress
    taskQueue.updateTaskProgress(task.id, 70);
    
    // Store settlements in the database
    const settlementRecords = [];
    
    for (const settlement of settlements) {
      // Prepare the settlement data
      const settlementInsertData: DbSettlements = {
        user_id: task.userId,
        month_year: settlement.month_year || new Date().toISOString().slice(0, 7),
        amount: settlement.amount,
        status: 'pending'
      };
      
      const { data, error } = await supabase
        .from('settlements')
        .insert(settlementInsertData)
        .select()
        .single();
        
      if (error) {
        logger.error('Error storing settlement:', error);
      } else if (data) {
        settlementRecords.push(data);
      }
    }
    
    return {
      settlements: settlementRecords,
      count: settlementRecords.length
    };
  } catch (error) {
    logger.error('Error calculating settlements:', error);
    throw error;
  }
}

/**
 * Handler for data export tasks
 */
interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
  recordsProcessed?: number;
}

interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  warningCount?: number;
}

async function handleDataExport(task: Task): Promise<ExportResult> {
  const { format, dataType, filters } = task.payload as {
    format: string;
    dataType: 'expenses' | 'settlements';
    filters: Record<string, unknown>;
  };
  
  logger.info(`Exporting ${dataType} data in ${format} format`);
  
  // Update progress
  taskQueue.updateTaskProgress(task.id, 20);
  
  try {
    // Fetch data based on type
    let data;
    
    switch (dataType) {
      case 'expenses':
        const query = supabase
          .from('expenses')
          .select(`
            *,
            categories(*),
            locations(*),
            users(*)
          `)
          .eq('paid_by', task.userId);
          
        // Apply filters if provided
        if (filters) {
          if (filters.startDate) {
            query.gte('date', filters.startDate);
          }
          if (filters.endDate) {
            query.lte('date', filters.endDate);
          }
          if (filters.category) {
            query.eq('categories.category', filters.category);
          }
        }
        
        const { data: expensesData } = await query;
        data = expensesData || [];
        break;
        
      case 'settlements':
        const { data: settlementsData } = await supabase
          .from('settlements')
          .select(`
            *,
            users(*)
          `)
          .eq('user_id', task.userId);
          
        data = settlementsData || [];
        break;
        
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }
    
    // Update progress
    taskQueue.updateTaskProgress(task.id, 60);
    
    // Format data based on requested format
    let formattedData;
    
    switch (format) {
      case 'json':
        formattedData = JSON.stringify(data, null, 2);
        break;
        
      case 'csv':
        // Simple CSV conversion
        if (data.length === 0) {
          formattedData = '';
          break;
        }
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => 
          Object.values(item)
            .map(value => typeof value === 'string' ? `"${value}"` : value)
            .join(',')
        );
        
        formattedData = [headers, ...rows].join('\n');
        break;
        
      default:
        throw new Error(`Unknown export format: ${format}`);
    }
    
    // Store the export in the database
    const exportInsertData: DbExports = {
      user_id: task.userId,
      data_type: dataType,
      format,
      filters: filters || {},
      file_name: `${dataType}_export_${new Date().toISOString()}.${format}`,
      file_data: formattedData
    };
    
    const { data: exportRecord, error } = await supabase
      .from('exports')
      .insert(exportInsertData)
      .select('id, file_name')
      .single();
      
    if (error) {
      throw new Error(`Failed to store export: ${error.message}`);
    }
    
    if (!exportRecord) {
      throw new Error('Failed to create export record');
    }
    
    return {
      exportId: exportRecord.id,
      fileName: exportRecord.file_name,
      format,
      dataType,
      recordCount: data.length
    };
  } catch (error) {
    logger.error('Error exporting data:', error);
    throw error;
  }
}

/**
 * Handler for data import tasks
 */
async function handleDataImport(task: Task): Promise<ImportResult> {
  const { format, dataType, data, _options } = task.payload as {
    format: string;
    dataType: string;
    data: unknown;
    _options?: Record<string, unknown>;
  };
  
  logger.info(`Importing ${dataType} data from ${format} format`);
  
  // Update progress
  taskQueue.updateTaskProgress(task.id, 10);
  
  try {
    // Parse data based on format
    let parsedData: Array<Record<string, string>> = [];
    
    switch (format) {
      case 'json':
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        break;
        
      case 'csv':
        // Simple CSV parsing
        const lines = data.split('\n');
        const headers = lines[0].split(',');
        
        parsedData = lines.slice(1).map((line: string) => {
          const values = line.split(',');
          return headers.reduce((obj: Record<string, string>, header: string, index: number) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        break;
        
      default:
        throw new Error(`Unknown import format: ${format}`);
    }
    
    // Update progress
    taskQueue.updateTaskProgress(task.id, 30);
    
    // Process data based on type
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ item: Record<string, string>; error: string }>
    };
    
    switch (dataType) {
      case 'expenses':
        // Process each expense
        for (const item of parsedData) {
          try {
            // Prepare expense data
            const expenseData: {
              paid_by: string;
              date: string;
              amount: number;
              notes: string;
              category_id: string | null;
              location_id: string | null;
            } = {
              paid_by: task.userId,
              date: item.date,
              amount: parseFloat(item.amount),
              notes: item.notes || '',
              category_id: null,
              location_id: null
            };
            
            // Look up or create category
            if (item.category) {
              const { data: categoryData } = await supabase
                .from('categories')
                .select('id')
                .eq('category', item.category)
                .eq('user_id', task.userId)
                .maybeSingle();
                
              if (categoryData) {
                expenseData.category_id = categoryData.id;
              } else {
                const { data: newCategory } = await supabase
                  .from('categories')
                  .insert({
                    user_id: task.userId,
                    category: item.category
                  })
                  .select('id')
                  .single();
                  
                if (newCategory) {
                  expenseData.category_id = newCategory.id;
                }
              }
            }
            
            // Look up or create location
            if (item.location) {
              const { data: locationData } = await supabase
                .from('locations')
                .select('id')
                .eq('location', item.location)
                .eq('user_id', task.userId)
                .maybeSingle();
                
              if (locationData) {
                expenseData.location_id = locationData.id;
              } else {
                const { data: newLocation } = await supabase
                  .from('locations')
                  .insert({
                    user_id: task.userId,
                    location: item.location
                  })
                  .select('id')
                  .single();
                  
                if (newLocation) {
                  expenseData.location_id = newLocation.id;
                }
              }
            }
            
            // Only insert if we have a valid category
            if (!expenseData.category_id) {
              throw new Error('Category is required');
            }
            
            // Insert expense
            const { error } = await supabase
              .from('expenses')
              .insert(expenseData);
              
            if (error) {
              throw new Error(error.message);
            }
            
            results.successful++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              item,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
        break;
        
      default:
        throw new Error(`Unsupported import data type: ${dataType}`);
    }
    
    return {
      dataType,
      format,
      totalProcessed: parsedData.length,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors
    };
  } catch (error) {
    logger.error('Error importing data:', error);
    throw error;
  }
}

// Initialize handlers when this module is imported
initializeTaskHandlers();