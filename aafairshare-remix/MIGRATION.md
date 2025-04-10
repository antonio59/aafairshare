# AAFairShare Migration Guide: Vite to Remix

This document outlines the process of migrating the AAFairShare application from Vite to Remix while preserving all existing Firebase resources and GitHub workflows.

## Overview

The migration involves:
1. Setting up a new Remix project structure
2. Configuring Firebase integration
3. Migrating components and pages
4. Setting up routing
5. Configuring deployment

## Prerequisites

- Node.js v20 or higher
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Git

## Migration Steps

### 1. Environment Setup

The `.env` file has been updated with the existing Firebase configuration:

```
FIREBASE_API_KEY=AIzaSyAYLQoJRCZ9ynyASEQ0zNWez9GUeNG4qsg
FIREBASE_AUTH_DOMAIN=aafairshare-37271.firebaseapp.com
FIREBASE_PROJECT_ID=aafairshare-37271
FIREBASE_STORAGE_BUCKET=aafairshare-37271.appspot.com
FIREBASE_MESSAGING_SENDER_ID=121020031141
FIREBASE_APP_ID=1:121020031141:web:c56c04b654aae5cfd76d4c
GOOGLE_APPLICATION_CREDENTIALS=ccbe8c81672357ba4f4ecbe738845764e598d154
```

### 2. Firebase Integration

- Client-side Firebase configuration is in `app/lib/firebase.ts`
- Server-side Firebase Admin configuration is in `app/config/firebase.server.ts`
- Authentication is handled through the `AuthContext` in `app/contexts/AuthContext.tsx`

### 3. Component Migration

When migrating components from the Vite project:

1. Copy the component files to the appropriate directories in the Remix project
2. Update imports to use the Remix convention (`~/` prefix for app directory)
3. Replace any Vite-specific code (like `import.meta.env`) with Remix equivalents

Example:
```tsx
// Vite version
import { useNavigate } from 'react-router-dom';
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Remix version
import { useNavigate } from '@remix-run/react';
const apiKey = window.ENV.FIREBASE_API_KEY;
```

### 4. Routing Migration

Remix uses file-based routing:

- `app/routes/_index.tsx` → `/` (home page)
- `app/routes/login.tsx` → `/login`
- `app/routes/settlement._index.tsx` → `/settlement`
- `app/routes/analytics._index.tsx` → `/analytics`
- `app/routes/recurring._index.tsx` → `/recurring`
- `app/routes/settings._index.tsx` → `/settings`

### 5. Data Fetching

Remix uses loader and action functions for data fetching and mutations:

```tsx
// Data loading
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Fetch data from Firestore
  return json({ data });
};

// Data mutations
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  // Update data in Firestore
  return redirect('/success');
};
```

### 6. Deployment

The project is configured for deployment to Firebase Hosting:

1. Build the project: `npm run build`
2. Deploy to Firebase: `npm run deploy`

GitHub workflows are set up to automatically deploy:
- On push to main branch
- Preview deployments for pull requests

## Testing

Before deploying to production:

1. Test authentication flow
2. Verify data fetching and mutations
3. Test all routes and components
4. Verify mobile responsiveness

## Rollback Plan

If issues arise during migration:

1. Keep the Vite version as the production deployment
2. Deploy the Remix version to a preview channel
3. Test thoroughly before switching the main domain

## Additional Resources

- [Remix Documentation](https://remix.run/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
