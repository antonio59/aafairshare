import { Database } from '../types/supabase.types';
import { PostgrestSingleResponse, PostgrestResponse, _PostgrestError } from '@supabase/supabase-js';

// Re-export database types for convenience
export type DbTables = Database['public']['Tables'];

// Type definitions for commonly used tables
export type DbExpense = DbTables['expenses']['Row'];
export type DbExpenseInsert = DbTables['expenses']['Insert'];
export type DbExpenseUpdate = DbTables['expenses']['Update'];

export type DbCategory = DbTables['categories']['Row'];
export type DbCategoryInsert = DbTables['categories']['Insert'];

export type DbLocation = DbTables['locations']['Row'];
export type DbLocationInsert = DbTables['locations']['Insert'];

export type DbUser = DbTables['users']['Row'];
export type DbUserInsert = DbTables['users']['Insert'];

export type DbSettings = DbTables['settings']['Row'];
export type DbSettlement = DbTables['settlements']['Row'];

/**
 * Safely cast a Supabase query result to the specified type
 * @param data - The data returned from Supabase query
 * @returns The data cast to the specified type, or null if data is null
 */
export function safeCastOne<T>(data: any): T | null {
  if (!data) return null;
  return data as unknown as T;
}

/**
 * Safely cast a Supabase query result array to the specified type
 * @param data - The data array returned from Supabase query
 * @returns The data cast to the specified type array, or empty array if data is null/undefined
 */
export function safeCastMany<T>(data: any): T[] {
  if (!data) return [];
  return data as unknown as T[];
}

/**
 * Safely handle a PostgrestSingleResponse and return properly typed data
 * @param response - The Supabase PostgrestSingleResponse
 * @returns Properly typed data or null
 */
export function handleSingleResponse<T>(response: PostgrestSingleResponse<any>): T | null {
  const { data, error } = response;
  if (error) throw error;
  return safeCastOne<T>(data);
}

/**
 * Safely handle a PostgrestResponse and return properly typed data array
 * @param response - The Supabase PostgrestResponse
 * @returns Properly typed data array or empty array
 */
export function handleManyResponse<T>(response: PostgrestResponse<any>): T[] {
  const { data, error } = response;
  if (error) throw error;
  return safeCastMany<T>(data);
}

/**
 * Create an error handler with logger for Supabase operations
 * @param logger - The logger instance to use
 * @param operationName - Name of the operation for logging context
 * @returns A function that logs and handles errors
 */
export function createErrorHandler(logger: any, operationName: string) {
  return (error: unknown): null => {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error in ${operationName}:`, errorMsg);
    return null;
  };
}

/**
 * Generate the proper select string for Supabase joins
 * @param mainFields - Fields to select from the main table (can be '*' or specific fields)
 * @param joins - Object mapping join aliases to their fields 
 * @returns Properly formatted select string for Supabase
 * 
 * @example
 * // Returns: '*, categories:category_id(id, name), users:user_id(id, email)'
 * generateSelectString('*', {
 *   'categories': { foreignKey: 'category_id', fields: ['id', 'name'] },
 *   'users': { foreignKey: 'user_id', fields: ['id', 'email'] }
 * })
 */
export function generateSelectString(
  mainFields: string, 
  joins: Record<string, { foreignKey: string, fields: string[] }>
): string {
  const joinStrings = Object.entries(joins).map(([table, { foreignKey, fields }]) => {
    return `${table}:${foreignKey}(${fields.join(', ')})`;
  });
  
  return [mainFields, ...joinStrings].join(', ');
}

/**
 * Format a standard error response
 */
export function formatErrorResponse(error: unknown): { success: false; message: string } {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  return { success: false, message };
}

/**
 * Format a standard success response
 */
export function formatSuccessResponse<T>(data: T): { success: true; data: T } {
  return { success: true, data };
} 