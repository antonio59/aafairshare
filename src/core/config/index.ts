interface ApiConfig {
  baseUrl: string;
  anonKey: string;
}

interface AuthConfig {
  persistenceKey: string;
  tokenRefreshInterval: number;
}

interface FeaturesConfig {
  settlements: boolean;
  currencyConversion: boolean;
}

interface SecurityConfig {
  csrfEnabled: boolean;
  maxAmountLimit: number;
  inputValidation: boolean;
}

interface UiConfig {
  theme: 'light' | 'dark';
  animation: boolean;
  toastDuration: number;
}

interface Config {
  api: ApiConfig;
  auth: AuthConfig;
  features: FeaturesConfig;
  security: SecurityConfig;
  ui: UiConfig;
}

export const config: Config = {
  api: {
    baseUrl: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  auth: {
    persistenceKey: 'auth_state',
    tokenRefreshInterval: 1000 * 60 * 60, // 1 hour
  },
  features: {
    settlements: true,
    currencyConversion: true,
  },
  security: {
    csrfEnabled: true,
    maxAmountLimit: 1000000,
    inputValidation: true,
  },
  ui: {
    theme: 'light',
    animation: true,
    toastDuration: 3000,
  }
}; 