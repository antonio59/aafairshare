# Next.js Migration Implementation Plan

This document provides a detailed implementation plan for migrating the AA FairShare application from Vite to Next.js.

## Implementation Steps

### 1. Prepare Project Structure

#### Files to Move from `next-migration-temp` to Project Root:
- `next.config.ts` → Update with proper configuration
- `postcss.config.mjs` → Rename to `postcss.config.js`
- `eslint.config.mjs` → Merge with existing eslint configuration
- `tsconfig.json` → Merge with existing tsconfig.base.json

#### Files to Preserve in Project Root:
- `.gitignore` → Merge with Next.js gitignore
- `README.md` → Update with Next.js information
- `.env.example` → Already using Next.js format
- All GitHub workflows and configuration files
- All documentation files

### 2. Update Configuration Files

#### Next.js Configuration
```typescript
// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve security headers from vercel.json
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Content-Security-Policy",
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https: data:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https://*.supabase.co; worker-src 'self' blob:; child-src 'self' blob:; manifest-src 'self'"
        }
      ]
    }
  ],
  // Add other configuration as needed
};

export default nextConfig;
```

#### TypeScript Configuration
Merge the Next.js tsconfig.json with the existing tsconfig.base.json, preserving path aliases.

#### Tailwind Configuration
Update the content paths to include Next.js app directory structure.

### 3. Migrate Environment Variables

- The `.env.example` file is already using the Next.js format with `NEXT_PUBLIC_` prefix
- Update all references in code from `import.meta.env.VITE_*` to `process.env.NEXT_PUBLIC_*`

### 4. Directory Structure Migration

#### App Directory Structure
```
src/
  app/
    api/
      expenses/
        route.ts
      health/
        route.ts
      settlements/
        route.ts
      users/
        route.ts
    expenses/
      [id]/
        page.tsx
      page.tsx
    settlements/
      page.tsx
    settings/
      page.tsx
    auth/
      page.tsx
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/
      button.tsx
      checkbox.tsx
      dialog.tsx
      label.tsx
      scroll-area.tsx
      tabs.tsx
    error-boundary.tsx
    NavBar.tsx
  contexts/
    AuthContext.tsx
  lib/
    config.ts
    utils.ts
  utils/
    api-fetcher.ts
    caching.ts
    currencyUtils.ts
    date-utils.ts
    errorHandling.ts
    logger.ts
    number-utils.ts
    retry-utils.ts
    task-handlers.ts
    task-queue.ts
    web-vitals.ts
  features/
    auth/
    expenses/
    settings/
    settlements/
    shared/
```

### 5. Component Migration

#### Convert React Router Routes to Next.js Pages
- Create page.tsx files in the appropriate app directory folders
- Update navigation to use Next.js Link component
- Replace useNavigate with Next.js router

#### Update Imports
- Update all imports to use Next.js conventions
- Replace relative imports with absolute imports using path aliases

### 6. API Routes Migration

- Create route.ts files in the app/api directory for each endpoint
- Implement GET, POST, PUT, DELETE handlers as needed
- Update frontend API calls to use Next.js API routes

### 7. Authentication Migration

- Update AuthContext to work with Next.js
- Implement middleware for protected routes
- Update Supabase client initialization

### 8. Update package.json

```json
{
  "name": "aafairshare",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "security:audit": "npm audit --json > npm-audit.json || true",
    "security:fix": "npm audit fix",
    "security:update": "npm update --save",
    "security:snyk": "snyk test --sarif-file-output=snyk.sarif",
    "security:snyk:license": "snyk test --license --sarif-file-output=snyk-license.sarif",
    "security:snyk:monitor": "snyk monitor --all-projects",
    "security:snyk:fix": "snyk wizard",
    "migrate:supabase": "chmod +x ./scripts/migrations/migrate-imports.sh && ./scripts/migrations/migrate-imports.sh",
    "gen:types": "npx supabase gen types typescript --project-id ccwcbnfnvkmwubkuvzns --schema public > src/core/types/supabase.types.ts",
    "keep-supabase-alive": "tsx scripts/keep-supabase-alive.ts",
    "setup-supabase-cron": "chmod +x ./scripts/setup-supabase-cron.sh && ./scripts/setup-supabase-cron.sh",
    "test": "vitest",
    "test:e2e": "playwright test --config=config/playwright/playwright.config.ts",
    "test:e2e:ui": "playwright test --config=config/playwright/playwright.config.ts --ui",
    "test:performance": "tsx scripts/run-lighthouse.ts --config=config/test/lighthouse-config.json",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@headlessui/react": "2.2.0",
    "@microsoft/fetch-event-source": "^2.0.1",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-icons": "1.3.2",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@supabase/supabase-js": "2.49.1",
    "canvg": "4.0.3",
    "chart.js": "^4.4.1",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "dayjs": "^1.11.13",
    "jspdf": "3.0.0",
    "jspdf-autotable": "^5.0.2",
    "lucide-react": "0.479.0",
    "next": "15.2.2",
    "pdfkit": "^0.16.0",
    "react": "^18.2.0",
    "react-chartjs-2": "^5.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "2.5.2",
    "react-virtualized-auto-sizer": "1.0.25",
    "react-window": "1.8.11",
    "tailwind-merge": "3.0.2",
    "uuid": "11.1.0",
    "zod": "3.24.2"
  },
  "devDependencies": {
    "@eslint/js": "9.22.0",
    "@playwright/test": "^1.41.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.0.1",
    "eslint": "^9",
    "eslint-config-next": "15.2.2",
    "postcss": "^8",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### 9. Update vercel.json

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "github": {
    "silent": true,
    "autoAlias": true
  },
  "regions": ["iad1"]
}
```

### 10. Testing and Validation

- Test all routes and functionality
- Verify API endpoints
- Test authentication flow
- Validate environment variables
- Check performance metrics

## Migration Execution Order

1. Create backup of current codebase
2. Update configuration files (next.config.ts, tsconfig.json, etc.)
3. Update package.json with Next.js dependencies
4. Create app directory structure
5. Migrate components and pages
6. Implement API routes
7. Update authentication
8. Update styling and assets
9. Test and fix issues
10. Update documentation

## Rollback Plan

If issues arise during migration:

1. Revert to the backup codebase
2. Document encountered issues
3. Create a new migration plan addressing the issues