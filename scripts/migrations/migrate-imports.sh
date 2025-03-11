#!/bin/bash

# ==============================================
# Supabase Import Migration Script Wrapper
# ==============================================
# This script is a wrapper for migrate-supabase-imports.ts
# that handles TypeScript execution environment selection.
#
# For detailed documentation, see:
# - README.md (Migration section)
# - docs/SUPABASE_MIGRATION.md (Technical details)
# ==============================================

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
TS_SCRIPT="${SCRIPT_DIR}/migrate-supabase-imports.ts"

echo "========================================================="
echo "  Supabase Import Migration Script"
echo "  Standardizing imports to @/core/api/supabase"
echo "========================================================="

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed. Please install Node.js which includes npx."
    exit 1
fi

# Try different methods to run the TypeScript file
if npx --no-install tsx &> /dev/null; then
    echo "✅ Using tsx to run the script..."
    npx tsx "${TS_SCRIPT}"
elif npx --no-install ts-node &> /dev/null; then
    echo "✅ Using ts-node to run the script..."
    npx ts-node "${TS_SCRIPT}"
else
    echo "ℹ️ Installing tsx temporarily to run the script..."
    npx tsx "${TS_SCRIPT}"
fi

# Check exit status
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo "   See docs/SUPABASE_MIGRATION.md for follow-up steps and verification."
else
    echo ""
    echo "❌ Migration encountered issues (exit code: $EXIT_CODE)."
    echo "   Please check the output above and refer to the troubleshooting"
    echo "   section in docs/SUPABASE_MIGRATION.md for help."
fi

exit $EXIT_CODE 