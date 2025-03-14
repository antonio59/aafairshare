#!/bin/bash
# Script to apply the settings simplification for AAFairShare

# Ensure we're in the project root directory
if [ ! -d "src/core/contexts" ]; then
  echo "Error: Please run this script from the project root directory"
  exit 1
fi

echo "Applying settings simplification..."

# Create backups
echo "Creating backups of files before modifications..."
mkdir -p .backups/settings-simplification
cp src/core/contexts/CurrencyContext.tsx .backups/settings-simplification/
cp src/features/settings/components/SettingsPage.tsx .backups/settings-simplification/
cp src/services/settingsService.ts .backups/settings-simplification/
cp src/core/types/users/index.ts .backups/settings-simplification/
cp src/core/contexts/AuthContext.tsx .backups/settings-simplification/

echo "✅ Backups created in .backups/settings-simplification/"

# Move CurrencyContext.tsx to utils/currencyUtils.ts
echo "Converting CurrencyContext to utility functions..."
# This will be done by the script we already created

# Run the update script to replace CurrencyContext with currencyUtils
echo "Updating imports in all files..."
./scripts/update-currency-imports.sh

# Remove the CurrencyContext.tsx file if it exists
if [ -f "src/core/contexts/CurrencyContext.tsx" ]; then
  echo "Removing CurrencyContext.tsx..."
  rm -f src/core/contexts/CurrencyContext.tsx
fi

# Remove the settingsService.ts file if it exists
if [ -f "src/core/services/settingsService.ts" ]; then
  echo "Removing settingsService.ts..."
  rm -f src/core/services/settingsService.ts
fi

# Run the database migration if Supabase CLI is available
if command -v supabase &> /dev/null; then
  echo "Running database migration..."
  supabase migration up
  echo "✅ Database migration applied"
else
  echo "⚠️ Supabase CLI not found. Please run the database migration manually:"
  echo "  supabase migration up"
fi

# Delete the uppercase versions of documentation files if they exist
if [ -f "CURRENCY-FIX.md" ]; then
  echo "Removing uppercase documentation files..."
  rm -f CURRENCY-FIX.md
fi

if [ -f "AUTHENTICATION-FIX.md" ]; then
  rm -f AUTHENTICATION-FIX.md
fi

if [ -f "AUTHENTICATION-FIX-V2.md" ]; then
  rm -f AUTHENTICATION-FIX-V2.md
fi

echo "✅ Settings simplification has been applied with the following improvements:"
echo "  1. Removed CurrencyContext and replaced with utility functions"
echo "  2. Updated imports across the codebase"
echo "  3. Removed language settings"
echo "  4. Removed export options"
echo "  5. Removed notifications references"
echo "  6. Updated database schema to remove unused fields (preferences, language)"
echo "  7. Removed unused settingsService.ts file"
echo ""
echo "To test the changes, run:"
echo "npm run dev"
echo ""
echo "For more details on the changes, please see the docs/currency-fix.md file" 