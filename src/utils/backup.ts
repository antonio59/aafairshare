import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString } from 'firebase/storage';
import { auth } from '../firebase';
import { logDataOperation, createLogEntry } from './logging';

interface BackupMetadata {
  timestamp: Timestamp;
  collections: string[];
  userId: string;
}

export const backupFirestoreData = async () => {
  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    // Collections to backup
    const collections = ['categories', 'categoryGroups', 'tags', 'expenses', 'budgets', 'recurringExpenses'];
    const backupData: { [key: string]: any[] } = {};

    // Fetch data from each collection
    for (const collectionName of collections) {
      const querySnapshot = await getDocs(collection(db, collectionName));
      backupData[collectionName] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    // Create backup metadata
    const metadata: BackupMetadata = {
      timestamp: Timestamp.now(),
      collections,
      userId: user.uid
    };

    // Create backup object with data and metadata
    const backup = {
      metadata,
      data: backupData
    };

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `backups/${user.uid}/${timestamp}.json`;
    
    // Upload to Firebase Storage
    const backupRef = ref(storage, backupPath);
    await uploadString(backupRef, JSON.stringify(backup), 'raw', {
      contentType: 'application/json',
    });

    // Log successful backup
    await logDataOperation(createLogEntry(
      'backup_created',
      'backups',
      user.uid,
      backupPath,
      { collections }
    ));

    return backupPath;
  } catch (error) {
    // Log backup failure
    await logDataOperation(createLogEntry(
      'backup_failed',
      'backups',
      user.uid,
      undefined,
      undefined,
      error instanceof Error ? error.message : 'Unknown error during backup'
    ));
    throw error;
  }
};

// Schedule daily backups
export const initializeBackupSchedule = () => {
  // Check if we already have a backup from today
  const checkAndCreateBackup = async () => {
    try {
      await backupFirestoreData();
    } catch (error) {
      console.error('Scheduled backup failed:', error);
    }
  };

  // Run backup immediately
  checkAndCreateBackup();

  // Schedule daily backups at 00:00
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const timeUntilMidnight = tomorrow.getTime() - now.getTime();

  // Schedule first backup
  setTimeout(() => {
    checkAndCreateBackup();
    // Then schedule recurring backups every 24 hours
    setInterval(checkAndCreateBackup, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);
};
