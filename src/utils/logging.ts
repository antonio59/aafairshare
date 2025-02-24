import { supabase } from '../supabase';

interface LogEntry {
  action: string;
  collection: string;
  documentId?: string;
  userId: string;
  timestamp: string;
  details?: Record<string, unknown>;
  error?: string;
}

export const logDataOperation = async (entry: LogEntry): Promise<void> => {
  try {
    const { error } = await supabase
      .from('data_operation_logs')
      .insert({
        ...entry,
        timestamp: new Date(entry.timestamp).toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to write log entry:', error);
    // Still log to console even if database write fails
    console.warn('Data Operation:', {
      ...entry,
      timestamp: entry.timestamp
    });
  }
};

export const createLogEntry = (
  action: string,
  collection: string,
  userId: string,
  documentId?: string,
  details?: Record<string, unknown>,
  error?: string
): LogEntry => ({
  action,
  collection,
  documentId,
  userId,
  timestamp: new Date().toISOString(),
  details,
  error
});
