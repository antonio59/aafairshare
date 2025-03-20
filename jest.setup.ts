import '@testing-library/jest-dom';
import * as React from 'react';

// Setup environment variables for tests using Object.defineProperty
// This avoids TypeScript errors with read-only properties
Object.defineProperty(process.env, 'NEXT_PUBLIC_SUPABASE_URL', {
  value: 'https://example.supabase.co',
  configurable: true
});
Object.defineProperty(process.env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', {
  value: 'example-anon-key',
  configurable: true
});

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Define mock component types
type MockComponentProps = {
  children: React.ReactNode;
  className?: string;
};

// Mock DOM elements for testing
type MockElement = (props: MockComponentProps) => React.ReactElement;

// Mock Shadcn UI components
const createMockElement = (testId: string): MockElement => {
  return ({ children, className }: MockComponentProps) => (
    React.createElement('div', {
      'data-testid': testId,
      className,
      children
    })
  );
};

// Create mock components
const mockComponents = {
  Card: createMockElement('card'),
  CardHeader: createMockElement('card-header'),
  CardTitle: createMockElement('card-title'),
  CardDescription: createMockElement('card-description'),
  CardContent: createMockElement('card-content'),
  CardFooter: createMockElement('card-footer'),
};

const mockScrollArea = createMockElement('scroll-area');

// Mock React hooks for React 19 compatibility
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useEffect: jest.fn((callback, deps) => originalReact.useEffect(callback, deps)),
    useState: jest.fn(originalReact.useState),
    useCallback: jest.fn(originalReact.useCallback),
    useMemo: jest.fn(originalReact.useMemo),
  };
});

// Mock Radix UI components
const mockTooltipProvider = createMockElement('tooltip-provider');
const mockTooltip = createMockElement('tooltip');
const mockTooltipTrigger = createMockElement('tooltip-trigger');
const mockTooltipContent = createMockElement('tooltip-content');
const mockBadge = createMockElement('badge');

// Setup component mocks
jest.mock('@/components/ui/card', () => mockComponents);

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: mockScrollArea,
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: mockTooltipProvider,
  Tooltip: mockTooltip,
  TooltipTrigger: mockTooltipTrigger,
  TooltipContent: mockTooltipContent,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: mockBadge,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'arrow-right-icon',
    })
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'check-icon',
    })
  ),
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'clock-icon',
    })
  ),
  AlertTriangle: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'alert-triangle-icon',
    })
  ),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Configure browser environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
>>>>>>> feat/react19-tailwind4-upgrade

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@/types/supabase', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  })),
}));
<<<<<<< HEAD
=======

// Mock native browser APIs
global.atob = jest.fn(str => Buffer.from(str, 'base64').toString('binary'));
global.btoa = jest.fn(str => Buffer.from(str, 'binary').toString('base64'));

// Use Node's native DOMException if available, otherwise mock it
if (!global.DOMException) {
  const DOMExceptionCodes = {
    INDEX_SIZE_ERR: 1,
    DOMSTRING_SIZE_ERR: 2,
    HIERARCHY_REQUEST_ERR: 3,
    WRONG_DOCUMENT_ERR: 4,
    INVALID_CHARACTER_ERR: 5,
    NO_DATA_ALLOWED_ERR: 6,
    NO_MODIFICATION_ALLOWED_ERR: 7,
    NOT_FOUND_ERR: 8,
    NOT_SUPPORTED_ERR: 9,
    INUSE_ATTRIBUTE_ERR: 10,
    INVALID_STATE_ERR: 11,
    SYNTAX_ERR: 12,
    INVALID_MODIFICATION_ERR: 13,
    NAMESPACE_ERR: 14,
    INVALID_ACCESS_ERR: 15,
    VALIDATION_ERR: 16,
    TYPE_MISMATCH_ERR: 17,
    SECURITY_ERR: 18,
    NETWORK_ERR: 19,
    ABORT_ERR: 20,
    URL_MISMATCH_ERR: 21,
    QUOTA_EXCEEDED_ERR: 22,
    TIMEOUT_ERR: 23,
    INVALID_NODE_TYPE_ERR: 24,
    DATA_CLONE_ERR: 25
  } as const;

  class DOMExceptionImpl extends Error implements DOMException {
    readonly INDEX_SIZE_ERR = DOMExceptionCodes.INDEX_SIZE_ERR;
    readonly DOMSTRING_SIZE_ERR = DOMExceptionCodes.DOMSTRING_SIZE_ERR;
    readonly HIERARCHY_REQUEST_ERR = DOMExceptionCodes.HIERARCHY_REQUEST_ERR;
    readonly WRONG_DOCUMENT_ERR = DOMExceptionCodes.WRONG_DOCUMENT_ERR;
    readonly INVALID_CHARACTER_ERR = DOMExceptionCodes.INVALID_CHARACTER_ERR;
    readonly NO_DATA_ALLOWED_ERR = DOMExceptionCodes.NO_DATA_ALLOWED_ERR;
    readonly NO_MODIFICATION_ALLOWED_ERR = DOMExceptionCodes.NO_MODIFICATION_ALLOWED_ERR;
    readonly NOT_FOUND_ERR = DOMExceptionCodes.NOT_FOUND_ERR;
    readonly NOT_SUPPORTED_ERR = DOMExceptionCodes.NOT_SUPPORTED_ERR;
    readonly INUSE_ATTRIBUTE_ERR = DOMExceptionCodes.INUSE_ATTRIBUTE_ERR;
    readonly INVALID_STATE_ERR = DOMExceptionCodes.INVALID_STATE_ERR;
    readonly SYNTAX_ERR = DOMExceptionCodes.SYNTAX_ERR;
    readonly INVALID_MODIFICATION_ERR = DOMExceptionCodes.INVALID_MODIFICATION_ERR;
    readonly NAMESPACE_ERR = DOMExceptionCodes.NAMESPACE_ERR;
    readonly INVALID_ACCESS_ERR = DOMExceptionCodes.INVALID_ACCESS_ERR;
    readonly VALIDATION_ERR = DOMExceptionCodes.VALIDATION_ERR;
    readonly TYPE_MISMATCH_ERR = DOMExceptionCodes.TYPE_MISMATCH_ERR;
    readonly SECURITY_ERR = DOMExceptionCodes.SECURITY_ERR;
    readonly NETWORK_ERR = DOMExceptionCodes.NETWORK_ERR;
    readonly ABORT_ERR = DOMExceptionCodes.ABORT_ERR;
    readonly URL_MISMATCH_ERR = DOMExceptionCodes.URL_MISMATCH_ERR;
    readonly QUOTA_EXCEEDED_ERR = DOMExceptionCodes.QUOTA_EXCEEDED_ERR;
    readonly TIMEOUT_ERR = DOMExceptionCodes.TIMEOUT_ERR;
    readonly INVALID_NODE_TYPE_ERR = DOMExceptionCodes.INVALID_NODE_TYPE_ERR;
    readonly DATA_CLONE_ERR = DOMExceptionCodes.DATA_CLONE_ERR;

    code: number;

    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'DOMException';
      this.code = DOMExceptionCodes[name as keyof typeof DOMExceptionCodes] || 0;
    }
  }

  // Add static properties to constructor
  Object.entries(DOMExceptionCodes).forEach(([key, value]) => {
    (DOMExceptionImpl as any)[key] = value;
  });

  global.DOMException = DOMExceptionImpl as any;
}

// Mock WebCrypto API
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      generateKey: jest.fn(),
      deriveKey: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
      wrapKey: jest.fn(),
      unwrapKey: jest.fn(),
    },
    getRandomValues: jest.fn(array => {
      return array.map(() => Math.floor(Math.random() * 256));
    }),
  },
});
>>>>>>> feat/react19-tailwind4-upgrade
