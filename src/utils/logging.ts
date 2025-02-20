import { supabase } from '../supabase';

interface LogEntry {
  action: string;
  collection: string;
  documentId?: string;
  userId: string;
  timestamp: Date;
  details?: any;
  error?: string;
}

export const logDataOperation = async (entry: LogEntry) => {
  const db = getFirestore();
  const logsCollection = collection(db, 'data_operation_logs');
  
  try {
    await addDoc(logsCollection, {
      ...entry,
      timestamp: Timestamp.fromDate(entry.timestamp)
    });
  } catch (error) {
    console.error('Failed to write log entry:', error);
    // Still log to console even if Firestore write fails
    console.warn('Data Operation:', {
      ...entry,
      timestamp: entry.timestamp.toISOString()
    });
  }
};

export const createLogEntry = (
  action: string,
  collection: string,
  userId: string,
  documentId?: string,
  details?: any,
  error?: string
): LogEntry => ({
  action,
  collection,
  documentId,
  userId,
  timestamp: new Date(),
  details,
  error
});
