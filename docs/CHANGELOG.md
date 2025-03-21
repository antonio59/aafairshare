# Changelog

## 2025-03-21

### UI Improvements
- Fixed logo size on the sign-in page (increased width to 120px and height to 48px)
- Verified favicon displays "AA" on a colored background
- Disabled sign-up functionality while preserving the page for future use
  - Added a clear message that registration is disabled
  - Visually disabled the sign-up button
  - Added a link to the sign-in page for better user flow

### Testing Improvements
- Fixed Tooltip and ScrollArea component mocks for React 19 compatibility
- Implemented proper testing utilities for React 19 concurrent mode
- Added specialized testing utilities for handling concurrent updates

### Documentation Updates
- Updated README.md with latest changes and improvements
- Updated React 19 upgrade documentation with testing and UI changes
- Created this CHANGELOG.md to track all changes

### Other Changes
- Pushed all changes to git repository
- Fixed various React 19 compatibility issues in tests
- Improved component mocking for better test reliability

## 2025-03-20

### React 19 & Tailwind CSS 4 Migration
- Updated to React 19.0.0 and React DOM 19.0.0
- Updated to Tailwind CSS 4.0.0
- Updated all related types and dependencies
- Configured PostCSS for Tailwind 4 compatibility

### Component Architecture
- Implemented proper server/client component boundaries
- Added effect cleanup functions for React 19 compatibility
- Upgraded to dynamic imports for client components
- Fixed hook dependencies and effect cleanups

### Testing Infrastructure
- Updated Jest configuration for React 19
- Created Supabase mocks for testing
- Enhanced component tests with data-testid attributes
- Fixed date handling for null/undefined values
