#!/bin/bash

# Set error handling
set -e

# Color constants for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running database migration for multiple locations support...${NC}"

# Check if we have the Supabase CLI installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed. Please install it first:${NC}"
    echo "npm install -g supabase"
    exit 1
fi

# Navigate to project root if needed
# cd "$(dirname "$0")"

echo -e "${GREEN}Applying database migration...${NC}"

# Option 1: Using Supabase CLI (if we're connected to a Supabase project)
supabase db push

# Option 2: Alternative method if you prefer manual SQL execution
# supabase db execute < supabase/migrations/20240311100000_create_expense_locations_table.sql

echo -e "${GREEN}Database migration completed successfully!${NC}"
echo -e "${YELLOW}Now you can restart your application to use the new features.${NC}"

exit 0 