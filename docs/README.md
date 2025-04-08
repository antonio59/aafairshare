# AAFairShare Documentation

This directory contains documentation for the AAFairShare application.

## Contents

- [Chart Library Removal](chart-removal.md) - Documentation explaining why chart libraries were removed from the Analytics page

## Technical Decisions

This section documents important technical decisions made during the development of the application.

### Dark Mode Implementation

The application uses CSS variables for theming, with proper dark mode support. The dark mode implementation follows these principles:

1. CSS variables are defined in `client/src/index.css`
2. The Tailwind configuration in `tailwind.config.ts` uses these variables
3. The application respects the user's system preference for dark/light mode
4. A theme toggle allows users to override their system preference

### Progressive Web App (PWA)

The application is configured as a Progressive Web App with the following features:

1. Offline support via service worker
2. Installable on mobile and desktop devices
3. Custom icons and splash screens
4. Manifest file for app configuration

### Cross-Domain Compatibility

The application is deployed to multiple domains:

1. Custom domain: https://aafairshare.online
2. Firebase hosting domains:
   - https://aafairshare-online.web.app
   - https://aafairshare-37271.web.app

To ensure compatibility across all domains, we:

1. Use relative URLs for resources when possible
2. Configure CORS headers in Firebase hosting
3. Ensure the service worker can handle requests from any domain

## Design Decisions

### Form Design

- The recurring expense form matches the add expense form fields and types
- The only differences are the additional fields specific to recurring expenses:
  - Frequency selection
  - Start date
  - End date (optional)
  - Active status toggle

### UI Styling

- Lighter borders (border-gray-200) are used throughout the application for consistency
- The application uses a consistent color scheme based on the Tailwind CSS color palette
- Form fields have consistent styling and behavior across the application
