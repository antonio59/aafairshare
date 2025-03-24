#!/bin/bash
set -e

# Make the script executable
chmod +x "$0"

echo "Starting lint fixes..."

# Directories to lint
DIRS=(
  "src/app"
  "src/components"
  "src/contexts"
  "src/hooks"
  "src/lib"
  "src/styles"
  "src/tests"
  "src/types"
  "src/utils"
)

# Individual files at root level
FILES=(
  "src/middleware.ts"
  "src/env.d.ts"
)

# Fix individual files first
for file in "${FILES[@]}"; do
  echo "Fixing $file..."
  npx eslint --config eslint.config.mjs "$file" --fix
done

# Fix directories one by one
for dir in "${DIRS[@]}"; do
  echo "Fixing files in $dir..."
  npx eslint --config eslint.config.mjs "$dir" --fix
done

echo "Lint fixes complete!"
