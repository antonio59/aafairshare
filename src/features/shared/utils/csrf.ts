import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';

interface CSRFHeaders {
  [key: string]: string;
}

interface CSRFHook {
  getToken: () => string;
  validateToken: (token: string) => boolean;
  refreshToken: () => string;
  getRequestHeaders: () => CSRFHeaders;
}

// CSRF token management
class CSRFManager {
  private readonly tokenKey: string;
  private readonly tokenHeaderName: string;

  constructor() {
    this.tokenKey = 'csrf_token';
    this.tokenHeaderName = 'X-CSRF-Token';
  }

  generateToken(): string {
    const token = uuidv4();
    localStorage.setItem(this.tokenKey, token);
    return token;
  }

  getToken(): string {
    let token = localStorage.getItem(this.tokenKey);
    if (!token) {
      token = this.generateToken();
    }
    return token;
  }

  validateToken(token: string): boolean {
    const storedToken = localStorage.getItem(this.tokenKey);
    return token === storedToken;
  }

  getRequestHeaders(): CSRFHeaders {
    return {
      [this.tokenHeaderName]: this.getToken()
    };
  }

  refreshToken(): string {
    return this.generateToken();
  }
}

export const csrfManager = new CSRFManager();

// CSRF middleware for Supabase requests
export function addCSRFToSupabaseClient<T extends SupabaseClient>(supabaseClient: T): T {
  const originalRequest = supabaseClient.request.bind(supabaseClient);
  
  supabaseClient.request = async function(
    method: string,
    path: string,
    options: Record<string, any> = {}
  ): Promise<any> {
    // Only add CSRF token for mutating requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase())) {
      options.headers = {
        ...options.headers,
        ...csrfManager.getRequestHeaders()
      };
    }
    
    return originalRequest(method, path, options);
  };
  
  return supabaseClient;
}

// React hook for CSRF protection
export function useCSRF(): CSRFHook {
  return {
    getToken: csrfManager.getToken.bind(csrfManager),
    validateToken: csrfManager.validateToken.bind(csrfManager),
    refreshToken: csrfManager.refreshToken.bind(csrfManager),
    getRequestHeaders: csrfManager.getRequestHeaders.bind(csrfManager)
  };
} 