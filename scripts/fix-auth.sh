#!/bin/bash
# This script fixes the authentication issue in AAFairShare by:
# 1. Removing the duplicate createUserProfile function
# 2. Ensuring the component-level createUserProfile is used

# Create a backup of the original file
cp src/core/contexts/AuthContext.tsx src/core/contexts/AuthContext.tsx.bak

# Delete the standalone createUserProfile function and keep the one in the component
sed -i.bak '85,135d' src/core/contexts/AuthContext.tsx

echo "Fixed authentication context file - removed duplicate createUserProfile function"
echo "A backup was created at src/core/contexts/AuthContext.tsx.bak"
echo ""
echo "For more details on the changes, please see the docs/authentication-fix.md file" 