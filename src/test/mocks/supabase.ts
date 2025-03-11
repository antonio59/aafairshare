import { vi } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client for testing
export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn()
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((callback) => callback({
      data: null,
      error: null
    }))
  }),
  storage: {
    listBuckets: vi.fn(),
    getBucket: vi.fn(),
    createBucket: vi.fn(),
    deleteBucket: vi.fn(),
    from: vi.fn().mockReturnValue({
      upload: vi.fn(),
      download: vi.fn(),
      getPublicUrl: vi.fn(),
      list: vi.fn(),
      remove: vi.fn()
    })
  }
} as unknown as SupabaseClient;

// Create a mock provider for wrapping components in tests
export const createTestSupabaseContext = () => {
  // This would be implemented based on your actual Supabase context
  // implementation. A basic example might look like:
  return {
    supabase: mockSupabaseClient,
    user: {
      id: 'test-user-id',
      email: 'test@example.com'
    },
    session: {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600
    },
    isLoading: false,
    error: null
  };
}; 