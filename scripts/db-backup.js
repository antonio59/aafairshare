#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * This script creates backups of the Supabase database using the Supabase CLI.
 * It can be scheduled to run regularly using cron or another scheduling tool.
 * 
 * Usage:
 *   node scripts/db-backup.js [options]
 * 
 * Options:
 *   --full      Create a full backup (default: false)
 *   --output    Specify output directory (default: ./backups)
 */

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

// Process command line arguments
const args = process.argv.slice(2);
const fullBackup = args.includes('--full');
const outputDirIndex = args.indexOf('--output');
const outputDir = outputDirIndex !== -1 && args[outputDirIndex + 1] 
  ? args[outputDirIndex + 1] 
  : path.join(process.cwd(), 'backups');

// Ensure the backup directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created backup directory: ${outputDir}`);
}

// Get current date in YYYY-MM-DD format for the filename
const now = new Date();
const dateString = now.toISOString().split('T')[0];
const timeString = now.toISOString().split('T')[1].replace(/:/g, '-').split('.')[0];
const backupType = fullBackup ? 'full' : 'schema';
const fileName = `${dateString}_${timeString}_${backupType}_backup.sql`;
const filePath = path.join(outputDir, fileName);

try {
  console.log(`Starting ${backupType} database backup...`);
  
  // Get Supabase project credentials
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or key not found in environment variables');
  }
  
  // Determine backup command based on backup type
  let command;
  if (fullBackup) {
    // Full backup includes schema and data
    command = `npx supabase db dump --db-url "${getDbUrl()}" -f "${filePath}"`;
  } else {
    // Schema-only backup
    command = `npx supabase db dump --db-url "${getDbUrl()}" --schema-only -f "${filePath}"`;
  }
  
  // Execute the backup command
  execSync(command, { stdio: 'inherit' });
  
  console.log(`Backup completed successfully: ${filePath}`);
  
  // Rotate backups (keep only the last 10 backups of each type)
  rotateBackups(outputDir, backupType);
  
} catch (error) {
  console.error('Backup failed:', error.message);
  process.exit(1);
}

/**
 * Helper function to get the database URL
 * This assumes you have the Supabase project details in your environment variables
 */
function getDbUrl() {
  // This is a placeholder - you'll need to adjust based on your actual DB connection details
  // You might need to run `supabase status` to get the actual connection string
  const dbHost = process.env.DB_HOST || 'db.ccwcbnfnvkmwubkuvzns.supabase.co';
  const dbPort = process.env.DB_PORT || '5432';
  const dbName = process.env.DB_NAME || 'postgres';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD;
  
  if (!dbPassword) {
    throw new Error('Database password not found in environment variables');
  }
  
  return `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
}

/**
 * Helper function to rotate backups (keep only the most recent ones)
 */
function rotateBackups(dir, type) {
  // Get all backup files of the specified type
  const files = fs.readdirSync(dir)
    .filter(file => file.endsWith('.sql') && file.includes(`_${type}_`))
    .map(file => ({
      name: file,
      path: path.join(dir, file),
      time: fs.statSync(path.join(dir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time); // Sort by date (newest first)
  
  // Keep only the most recent backups (adjust the number as needed)
  const maxBackups = 10;
  if (files.length > maxBackups) {
    const filesToDelete = files.slice(maxBackups);
    
    filesToDelete.forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`Removed old backup: ${file.name}`);
    });
    
    console.log(`Backup rotation complete. Kept ${maxBackups} most recent ${type} backups.`);
  }
} 