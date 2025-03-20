// Mock for @supabase/ssr
export const createBrowserClient = jest.fn(() => ({
  auth: {
    onAuthStateChange: jest.fn(() => ({
      data: {
        subscription: {
          unsubscribe: jest.fn()
        }
      }
    })),
    getSession: jest.fn(() => ({
      data: {
        session: {
          user: {
            id: 'mock-user-id',
            email: 'user@example.com'
          }
        }
      }
    }))
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [],
          error: null
        }))
      }))
    })),
    upsert: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [],
        error: null
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }))
}));

export const createServerClient = jest.fn(() => ({
  auth: {
    getSession: jest.fn(() => ({
      data: {
        session: {
          user: {
            id: 'mock-user-id',
            email: 'user@example.com'
          }
        }
      }
    }))
  }
}));
