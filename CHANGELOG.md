# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Fixed E2E test failures by creating proper test pages for visual regression tests
- Updated authentication flow in tests to align with actual implementation
- Resolved workflow failures related to component naming and export standards
- Updated test fixture paths to match the expected structure

### Added
- Created test pages for visual regression:
  - Buttons test page
  - Cards test page
  - Forms test page
  - Dialogs test page
  - Responsive test page
  - Theme test page
- Added auth.setup.ts for consistent test authentication
- Created proper playwright authentication state handling
- Added CHANGELOG.md to track project changes

## [0.2.0] - 2025-03-21

### Added
- Completed React 19 and Tailwind CSS 4 migration
- Added proper server/client component boundaries
- Enhanced error handling and authentication flows
- Implemented dynamic imports for client components

### Changed
- Updated all dependencies to latest compatible versions
- Improved component architecture for React 19 compatibility
- Enhanced error boundary components
- Fixed effect cleanup functions for React 19 compatibility

### Removed
- Currency selection features (now GBP only)
- Language settings (now English only)
- Preferences column from database
- Entire settings table as it's no longer needed

## [0.1.0] - 2025-02-15

### Added
- Initial release with basic expense tracking functionality
- Supabase integration for authentication and database
- Settlement calculation features
- Basic UI components and responsive design
