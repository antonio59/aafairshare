#!/usr/bin/env node

/**
 * Database Backup Script
 * 
 * This script creates backups of the Supabase database using the Supabase CLI.
 * It can be scheduled to run regularly using cron or another scheduling tool.
 * 
 * Usage:
 *   tsx scripts/db-backup.ts [options]
 * 
 * Options:
 *   --full      Create a full backup (default: false)
 *   --output    Specify output directory (default: ./backups)
 */

import { execSync, ExecSyncOptions } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

interface BackupFile {
  name: string;
  path: string;
  time: number;
}

interface BackupOptions {
  fullBackup: boolean;
  outputDir: string;
}

interface DbConfig {
  host: string;
  port: string;
  name: string;
  user: string;
  password: string;
}

// Load environment variables
config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

/**
 * Parse command line arguments
 */
function parseArgs(): BackupOptions {
  const args = process.argv.slice(2);
  const fullBackup = args.includes('--full');
  const outputDirIndex = args.indexOf('--output');
  const outputDir = outputDirIndex !== -1 && args[outputDirIndex + 1] 
    ? args[outputDirIndex + 1] 
    : join(process.cwd(), 'backups');

  return { fullBackup, outputDir };
}

/**
 * Ensure backup directory exists
 */
function ensureBackupDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`Created backup directory: ${dir}`);
  }
}

/**
 * Generate backup filename
 */
function generateBackupFilename(backupType: string): string {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  const timeString = now.toISOString().split('T')[1].replace(/:/g, '-').split('.')[0];
  return `${dateString}_${timeString}_${backupType}_backup.sql`;
}

/**
 * Get database configuration from environment
 */
function getDbConfig(): DbConfig {
  const config: DbConfig = {
    host: process.env.DB_HOST || 'db.ccwcbnfnvkmwubkuvzns.supabase.co',
    port: process.env.DB_PORT || '5432',
    name: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD || ''
  };

  if (!config.password) {
    throw new Error('Database password not found in environment variables');
  }

  return config;
}

/**
 * Get database URL for Supabase CLI
 */
function getDbUrl(config: DbConfig): string {
  const { host, port, name, user, password } = config;
  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
}

/**
 * Execute backup command
 */
function executeBackup(dbUrl: string, filePath: string, fullBackup: boolean): void {
  const command = fullBackup
    ? `npx supabase db dump --db-url "${dbUrl}" -f "${filePath}"`
    : `npx supabase db dump --db-url "${dbUrl}" --schema-only -f "${filePath}"`;

  const options: ExecSyncOptions = { stdio: 'inherit' };
  execSync(command, options);
}

/**
 * Rotate backups to keep only recent ones
 */
function rotateBackups(dir: string, type: string, maxBackups: number = 10): void {
  const files: BackupFile[] = readdirSync(dir)
    .filter(file => file.endsWith('.sql') && file.includes(`_${type}_`))
    .map(file => ({
      name: file,
      path: join(dir, file),
      time: statSync(join(dir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length > maxBackups) {
    const filesToDelete = files.slice(maxBackups);
    
    filesToDelete.forEach(file => {
      unlinkSync(file.path);
      console.log(`Removed old backup: ${file.name}`);
    });
    
    console.log(`Backup rotation complete. Kept ${maxBackups} most recent ${type} backups.`);
  }
}

/**
 * Validate Supabase connection
 */
async function validateSupabaseConnection(): Promise<void> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or key not found in environment variables');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase.from('_schema').select('version').limit(1);
    if (error) throw error;
    console.log('Supabase connection validated');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to validate Supabase connection: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Main backup process
 */
async function main(): Promise<void> {
  try {
    const { fullBackup, outputDir } = parseArgs();
    const backupType = fullBackup ? 'full' : 'schema';

    // Ensure backup directory exists
    ensureBackupDir(outputDir);

    // Generate backup filename
    const fileName = generateBackupFilename(backupType);
    const filePath = join(outputDir, fileName);

    console.log(`Starting ${backupType} database backup...`);

    // Validate Supabase connection
    await validateSupabaseConnection();

    // Get database configuration and URL
    const dbConfig = getDbConfig();
    const dbUrl = getDbUrl(dbConfig);

    // Execute backup
    executeBackup(dbUrl, filePath, fullBackup);
    console.log(`Backup completed successfully: ${filePath}`);

    // Rotate backups
    rotateBackups(outputDir, backupType);

  } catch (error) {
    console.error('Backup failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('Unhandled error:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
