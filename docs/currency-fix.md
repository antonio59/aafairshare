# Comprehensive Settings Simplification for AAFairShare

## Changes Made

The application has been completely simplified by removing several unnecessary features:

1. **Currency Selection Removed**: The app now exclusively uses GBP (£) as the currency.
2. **Language Settings Removed**: The app now uses English only.
3. **Export Option Removed**: The export functionality has been removed from settings as it's handled in analytics.
4. **Notifications References Removed**: References to notifications were removed as they're not being used.
5. **User Preferences Removed**: The preferences column was completely removed from the database.
6. **Settings Table Dropped**: The entire settings table was dropped as it's no longer needed.

### Reason for Changes

These features were causing unnecessary complexity and bugs:

1. The CurrencyContext was encountering errors when trying to access database tables and fields.
2. Maintaining multiple currencies and languages added complexity without providing essential functionality.
3. Having duplicate export functionality in both settings and analytics was confusing for users.
4. The preferences column contained fields that weren't actually used in the application.

## Implementation Details

### 1. Replaced CurrencyContext with Utility Functions

- Removed the CurrencyContext.tsx file completely
- Created a simple currencyUtils.ts utility file with formatting functions
- Updated all component imports to use the utility functions directly
- Eliminated React Context overhead for a simple formatting utility

### 2. Updated Settings Page

- Removed the currency selection section
- Removed the language settings section
- Removed the import/export section
- Kept only category and location management

### 3. Database Schema Changes

- Removed the `language` column from the `users` table
- Removed the `preferences` column from the `users` table
- Dropped the `settings` table entirely
- Updated database policies for the simplified schema

### 4. Updated Service Layer

- Simplified the settings service to only provide basic user info updates
- Updated the auth context to remove preferences and language field references
- Removed all the settings retrieval and processing logic

## Technical Benefits

1. **Drastically Reduced Code Complexity**: Removed over 300 lines of code across multiple files.
2. **Eliminated Type Errors**: Fixed TypeScript errors related to database schema access.
3. **Improved Performance**: Reduced database queries, unnecessary state management, and React Context overhead.
4. **Simplified User Experience**: Users no longer need to make choices about currency or language.
5. **Cleaner Database Schema**: Removed unused columns and tables for a simpler database structure.
6. **Better Maintainability**: Fewer features to maintain and simpler code paths.
7. **Reduced Bundle Size**: Smaller JavaScript payload by removing unused features.

## Migration Path

A migration script has been created at `supabase/migrations/20240630000000_remove_unused_settings.sql` that:

1. Removes the `language` column from the `users` table
2. Removes the `preferences` column from the `users` table
3. Drops the `settings` table entirely
4. Updates relevant policies

Additionally, a utility script has been created to:

1. Convert CurrencyContext to a simple utility function
2. Update all component imports appropriately
3. Remove the CurrencyContext.tsx file

## Future Considerations

If any of these features become necessary in the future:

1. **Multi-currency Support**: Should be implemented with proper type definitions and a dedicated currency service.
2. **User Preferences**: Should have a dedicated schema with clear documentation on what fields are actually used.
3. **Settings**: Should be consolidated into a single approach rather than scattered across different tables. 