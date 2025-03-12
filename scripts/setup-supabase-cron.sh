#!/bin/bash

# This script sets up a cron job to keep the Supabase instance active

# Make the keep-supabase-alive.ts script executable
chmod +x ./scripts/keep-supabase-alive.ts

# Get the absolute path of the project
PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# Create a temporary cron file
CRON_TMP=$(mktemp)

# Check if cron job already exists
crontab -l > "$CRON_TMP" 2>/dev/null || echo "" > "$CRON_TMP"

# Check if the cron job already exists in the file
if grep -q "keep-supabase-alive" "$CRON_TMP"; then
  echo "Cron job already exists."
else
  # Add the weekly cron job to run every Sunday at 1:00 AM
  echo "# Keep Supabase instance active - runs every Sunday at 1:00 AM" >> "$CRON_TMP"
  echo "0 1 * * 0 cd $PROJECT_DIR && npm run keep-supabase-alive >> $PROJECT_DIR/logs/supabase-ping.log 2>&1" >> "$CRON_TMP"
  
  # Apply the new cron job
  crontab "$CRON_TMP"
  
  echo "Cron job has been added. It will run every Sunday at 1:00 AM."
fi

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Clean up the temporary file
rm "$CRON_TMP"

echo "Setup complete. You can verify your cron jobs by running: crontab -l" 