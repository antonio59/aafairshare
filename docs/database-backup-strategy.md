# Database Backup Strategy

This document outlines our database backup strategy to ensure data integrity and provide disaster recovery capabilities.

## Overview

We use a combination of automated and manual backup procedures to protect our Supabase database. The strategy employs a multi-layered approach to mitigate different types of data loss scenarios.

## Backup Types

### Automated Regular Backups

1. **Daily Schema Backups**
   - Frequency: Daily at 01:00 UTC
   - Retention: 10 most recent backups
   - Content: Database schema only (tables, views, functions, etc.)
   - Storage: Local backup directory and cloud storage

2. **Weekly Full Backups**
   - Frequency: Weekly on Sunday at 02:00 UTC
   - Retention: 8 most recent backups (2 months)
   - Content: Complete database (schema and data)
   - Storage: Local backup directory and cloud storage

3. **Pre-Deployment Backups**
   - Timing: Automatically before each production deployment
   - Retention: 5 most recent deployment backups
   - Content: Complete database (schema and data)
   - Storage: Deployment pipeline artifacts

### Additional Safeguards

1. **Supabase Platform Backups**
   - Supabase automatically creates daily backups with 7-day retention
   - These are accessible through the Supabase dashboard

2. **Point-in-Time Recovery**
   - Supabase Pro and Enterprise plans offer point-in-time recovery
   - Allows restoring the database to any moment in the last 7 days

## Implementation

### Automation Tools

1. **Backup Script**
   - Located at: `scripts/db-backup.js`
   - Features:
     - Configurable backup type (schema or full)
     - Automatic backup rotation
     - Error reporting

2. **Scheduling**
   - Daily schema backups: Scheduled via GitHub Actions workflow at 01:00 UTC
   - Weekly full backups: Scheduled via GitHub Actions workflow at 02:00 UTC on Sundays
   - Pre-deployment: Integrated into CI/CD pipeline
   
   The GitHub Actions workflow is defined in `.github/workflows/db-backup.yml` and includes:
   - Automated execution of the backup script
   - Storage of backups in GitHub Artifacts (short-term)
   - Uploading to S3 bucket (long-term storage)
   - Slack notifications for backup failures
   - Manual trigger option for on-demand backups

### Backup Storage

1. **Primary Storage**
   - Cloud storage bucket (AWS S3 or equivalent)
   - Encrypted at rest
   - Access restricted to authorized personnel

2. **Secondary Storage**
   - Local backup directory on deployment server
   - GitHub Actions artifacts (short-term)

## Recovery Procedures

### Restore From Backup

1. **Full Database Restore**
   ```bash
   # Restore a full backup
   npx supabase db restore --db-url "postgresql://postgres:password@host:port/postgres" -f "path/to/backup.sql"
   ```

2. **Schema-Only Restore**
   ```bash
   # Restore schema only
   npx supabase db restore --db-url "postgresql://postgres:password@host:port/postgres" -f "path/to/schema-backup.sql"
   ```

3. **Using Supabase Dashboard**
   - Navigate to the Supabase project dashboard
   - Go to Project Settings > Database
   - Select "Backups" and choose a backup to restore

### Emergency Contacts

In case of database emergency:

1. Primary: Database Administrator (dba@yourdomain.com)
2. Secondary: DevOps Team Lead (devops@yourdomain.com)
3. Escalation: CTO (cto@yourdomain.com)

## Validation and Testing

To ensure our backup strategy is effective:

1. **Monthly Restore Tests**
   - Schedule: First Monday of each month
   - Process: Restore the latest full backup to a test environment
   - Validation: Run automated tests against the restored database

2. **Backup Validation**
   - Each backup is automatically validated after creation
   - Checks include file integrity, size, and basic structure

## Compliance and Auditing

1. **Backup Logs**
   - All backup operations are logged
   - Logs are retained for 1 year

2. **Audit Trail**
   - Quarterly audit of backup and restore procedures
   - Verification of backup integrity and restore capability 