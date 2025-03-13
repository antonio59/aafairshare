#!/bin/bash

# Script to update currency imports from CurrencyContext to currencyUtils

# Find all files that import from CurrencyContext
echo "Finding files that import from CurrencyContext..."
FILES=$(grep -l "import.*from.*CurrencyContext" --include="*.tsx" --include="*.ts" -r src/)

# Process each file
for file in $FILES; do
  echo "Processing $file..."
  
  # Create a backup
  cp "$file" "$file.bak"
  
  # Replace the import
  sed -i '' 's/import { useCurrency } from "..\/..\/..\/core\/contexts\/CurrencyContext";/import { formatAmount, formatCurrency } from "..\/..\/..\/utils\/currencyUtils";/g' "$file"
  sed -i '' "s/import { useCurrency } from '..\/..\/..\/core\/contexts\/CurrencyContext';/import { formatAmount, formatCurrency } from '..\/..\/..\/utils\/currencyUtils';/g" "$file"
  
  # Replace the usage
  sed -i '' 's/const { formatAmount } = useCurrency();/\/\/ formatAmount is now imported directly/g' "$file"
  sed -i '' 's/const { formatAmount, formatCurrency } = useCurrency();/\/\/ formatAmount and formatCurrency are now imported directly/g' "$file"
  sed -i '' 's/const { formatCurrency } = useCurrency();/\/\/ formatCurrency is now imported directly/g' "$file"
  
  # More complex replacements
  sed -i '' 's/const { currency, formatAmount } = useCurrency();/\/\/ currency is always GBP now\nconst currency = "GBP";/g' "$file"
  sed -i '' 's/const currencyContext = useCurrency();/\/\/ currencyContext is replaced with direct imports\nconst currency = "GBP";/g' "$file"
  sed -i '' 's/const { currency, supportedCurrencies } = useCurrency();/\/\/ currency is always GBP now\nconst currency = "GBP";\nconst supportedCurrencies = { GBP: { symbol: "£", name: "British Pound" } };/g' "$file"
  
  echo "Updated $file"
done

echo "Completed updating currency imports in $(echo "$FILES" | wc -l) files." 