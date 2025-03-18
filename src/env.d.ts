// Environment variable type definitions for Next.js

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    readonly NEXT_PUBLIC_API_URL: string;
    readonly NEXT_PUBLIC_ENVIRONMENT: 'development' | 'production' | 'staging';
    readonly NEXT_PUBLIC_FEATURE_FLAGS: string;
    readonly NEXT_PUBLIC_APP_VERSION: string;
    readonly NEXT_PUBLIC_ANALYTICS_ID?: string;
    readonly NEXT_PUBLIC_ENABLE_PREMIUM_FEATURES?: string;
    readonly NEXT_PUBLIC_ENABLE_NOTIFICATIONS?: string;
    readonly NEXT_PUBLIC_API_TIMEOUT?: string;
  }
}