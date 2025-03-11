/**
 * Application configuration service
 * Handles environment variables and feature flags
 */

interface FeatureFlags {
  enableExperimentalFeatures: boolean;
  debugMode: boolean;
  [key: string]: boolean | string | number;
}

interface AppConfig {
  environment: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  apiUrl: string;
  sentryDsn: string | undefined;
  sentryEnvironment: string | undefined;
  sentryTracesSampleRate: number;
  featureFlags: FeatureFlags;
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  analytics: {
    enabled: boolean;
    id: string | undefined;
  };
}

// Parse feature flags from environment variable
function parseFeatureFlags(): FeatureFlags {
  const defaultFlags: FeatureFlags = {
    enableExperimentalFeatures: false,
    debugMode: false,
  };

  try {
    const flagsEnv = import.meta.env.VITE_FEATURE_FLAGS;
    if (!flagsEnv) return defaultFlags;
    
    return {
      ...defaultFlags,
      ...JSON.parse(flagsEnv)
    };
  } catch (error) {
    console.error('Error parsing feature flags:', error);
    return defaultFlags;
  }
}

// Create the configuration object from environment variables
const config: AppConfig = {
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  sentryEnvironment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  sentryTracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.1),
  featureFlags: parseFeatureFlags(),
  isProduction: import.meta.env.VITE_ENVIRONMENT === 'production',
  isDevelopment: import.meta.env.VITE_ENVIRONMENT === 'development',
  isStaging: import.meta.env.VITE_ENVIRONMENT === 'staging',
  analytics: {
    enabled: !!import.meta.env.VITE_ANALYTICS_ID,
    id: import.meta.env.VITE_ANALYTICS_ID
  }
};

/**
 * Check if a feature flag is enabled
 * @param flag - The name of the feature flag
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return !!config.featureFlags[flag];
}

/**
 * Get a configuration value
 * @param key - The configuration key to retrieve
 * @returns The configuration value
 */
export function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return config[key];
}

/**
 * Get all configuration values
 * @returns The complete configuration object
 */
export function getAllConfig(): Readonly<AppConfig> {
  return Object.freeze({ ...config });
}

export default {
  getConfig,
  getAllConfig,
  isFeatureEnabled
}; 