# Supabase Client Migration Guide

## Background

### Problem Statement
The application was previously using multiple Supabase client instances created in different modules:
- One in `src/lib/supabase.ts` (deprecated)
- Another in `src/core/api/supabase.ts` (preferred)

This resulted in:
1. Console warnings: `WARNING: Using deprecated supabase import from lib/supabase.ts`
2. Potential authentication conflicts due to multiple `GoTrueClient` instances
3. Inconsistent cache management
4. Potential memory leaks

### Technical Impact
Multiple Supabase client instances can lead to:
- Race conditions in authentication state
- Inconsistent database cache
- Unnecessary duplicate network requests
- Higher memory usage

## Migration Solution

### Architecture Changes

1. **Single Source of Truth**
   - The Supabase client is now exclusively instantiated in `src/core/api/supabase.ts`
   - This file includes proper TypeScript typings with the Database type
   - Authentication settings are consistently applied

2. **Backward Compatibility**
   - The deprecated file `src/lib/supabase.ts` now re-exports the client from core
   - It displays a warning in development mode to encourage migration
   - This ensures existing imports continue to work during migration

3. **Automated Migration Tools**
   - TypeScript-based migration script
   - Shell script wrapper for easier execution

## Migration Scripts

### Technical Implementation

#### NPM Script

The easiest way to run the migration is using the provided npm script:

```bash
npm run migrate:supabase
```

This script handles file permissions and executes the migration with the appropriate TypeScript runner.

#### TypeScript Migration Script (`scripts/migrations/migrate-supabase-imports.ts`)

This script uses TypeScript's native file system APIs to:
1. Scan for specified files with deprecated imports
2. Use regex pattern matching to identify import statements
3. Replace them with the standardized import path
4. Provide detailed reporting

Key features:
- Type-safe implementation
- Detailed error handling
- File existence validation
- Non-destructive operation (only modifies files with matches)

#### Shell Script Wrapper (`scripts/migrations/migrate-imports.sh`)

The wrapper script:
1. Provides a cross-platform execution environment
2. Handles missing dependencies gracefully
3. Attempts multiple execution methods (tsx, ts-node)
4. Reports success/failure status

## Developer Guidelines

### Best Practices for Supabase Usage

1. **Import Pattern**
   ```typescript
   // ✅ Correct
   import { supabase } from '@/core/api/supabase';
   
   // ❌ Deprecated
   import { supabase } from '../lib/supabase';
   ```

2. **Type-Safe Queries**
   ```typescript
   // Get the client with proper type information
   import { supabase } from '@/core/api/supabase';
   import type { Database } from '@/core/types/supabase.types';
   
   // Use with type safety
   const { data, error } = await supabase
     .from('expenses')
     .select<typeof error, Database['public']['Tables']['expenses']['Row']>('*');
   ```

3. **Error Handling**
   ```typescript
   const { data, error } = await supabase.from('expenses').select('*');
   
   if (error) {
     logger.error('Database error:', error);
     throw new Error(`Failed to fetch expenses: ${error.message}`);
   }
   ```

### Validation After Migration

After running the migration script, you should:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Check for TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

3. **Verify no console warnings**
   Check browser console during development for any remaining warnings

## Technical Details

### Path Alias Configuration

The `@/` path alias is configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

And in `vite.config.ts` for runtime resolution:

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### Files Known to Use Deprecated Imports

The following files were identified as using the deprecated import pattern:

- `src/services/settingsService.ts`
- `src/services/userService.ts`
- `src/services/aiService.ts`
- `src/services/importExportService.ts`
- `src/services/settlementService.ts`
- `src/test-supabase.ts`
- `src/features/settlements/hooks/useSettlementGuard.ts`

### Supabase Client Configuration

The recommended client configuration in `src/core/api/supabase.ts` includes:

```typescript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

## Troubleshooting

### Common Issues

1. **Missing TypeScript Executor**
   ```
   env: ts-node: No such file or directory
   ```
   Solution: Use the shell script wrapper or install tsx: `npm install -g tsx`

2. **Type Errors After Migration**
   ```
   Property 'X' does not exist on type 'SupabaseClient<Database>'
   ```
   Solution: Update type imports or add necessary type assertions

3. **Path Alias Resolution Issues**
   ```
   Cannot find module '@/core/api/supabase'
   ```
   Solution: Verify path alias configuration in both tsconfig.json and vite.config.ts

## Contact

For questions about this migration, please contact the development team.

---

**Document Version:** 1.0  
**Last Updated:** July 2024  
**Author:** Development Team 