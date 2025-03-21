import '@testing-library/jest-dom';
import * as React from 'react';

// Comprehensive React 19 compatibility setup
// These settings help suppress warnings and ensure tests run correctly with React 19
process.env.REACT_DOM_ACT_WARNINGS = 'false';

// NODE_ENV is already set to 'test' by Jest automatically

// Suppress specific console warnings for React 19
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorMsg = typeof args[0] === 'string' ? args[0] : '';
  
  // Filter out common React 19 warnings
  if (errorMsg.includes('ReactDOMTestUtils.act') || 
      errorMsg.includes('React.act') || 
      errorMsg.includes('inside a test was not wrapped in act') ||
      errorMsg.includes('Warning: ReactDOM.render')) {
    return;
  }
  originalConsoleError(...args);
};

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

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnValue({ error: null }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null })))
    })
  }))
}));

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
  Button: createMockElement('button'),
  Badge: createMockElement('badge'),
  Tabs: createMockElement('tabs'),
  TabsList: createMockElement('tabs-list'),
  TabsTrigger: createMockElement('tabs-trigger'),
  TabsContent: createMockElement('tabs-content'),
  ScrollArea: createMockElement('scroll-area'),
  Input: createMockElement('input'),
  Label: createMockElement('label'),
  Select: createMockElement('select'),
  SelectTrigger: createMockElement('select-trigger'),
  SelectValue: createMockElement('select-value'),
  SelectContent: createMockElement('select-content'),
  SelectItem: createMockElement('select-item'),
  Dialog: createMockElement('dialog'),
  DialogTrigger: createMockElement('dialog-trigger'),
  DialogContent: createMockElement('dialog-content'),
  DialogHeader: createMockElement('dialog-header'),
  DialogTitle: createMockElement('dialog-title'),
  DialogDescription: createMockElement('dialog-description'),
  Tooltip: createMockElement('tooltip'),
  TooltipProvider: createMockElement('tooltip-provider'),
  TooltipContent: createMockElement('tooltip-content'),
  TooltipTrigger: createMockElement('tooltip-trigger'),
  DialogFooter: createMockElement('dialog-footer'),
  Toast: createMockElement('toast'),

  Calendar: createMockElement('calendar'),
  Checkbox: createMockElement('checkbox'),
  Skeleton: createMockElement('skeleton'),
  Form: createMockElement('form'),
  FormField: createMockElement('form-field'),
  FormItem: createMockElement('form-item'),
  FormLabel: createMockElement('form-label'),
  FormControl: createMockElement('form-control'),
  FormDescription: createMockElement('form-description'),
  FormMessage: createMockElement('form-message'),
  Toaster: createMockElement('toaster'),
};

// Mock UI components
jest.mock('@/components/ui/button', () => mockComponents.Button);
jest.mock('@/components/ui/card', () => mockComponents);
jest.mock('@/components/ui/badge', () => ({
  Badge: mockComponents.Badge
}));
jest.mock('@/components/ui/tabs', () => mockComponents);
jest.mock('@/components/ui/input', () => mockComponents.Input);
jest.mock('@/components/ui/label', () => mockComponents.Label);
jest.mock('@/components/ui/select', () => mockComponents);
jest.mock('@/components/ui/dialog', () => mockComponents);
jest.mock('@/components/ui/toast', () => mockComponents);
jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: mockComponents.Tooltip,
  TooltipProvider: mockComponents.TooltipProvider,
  TooltipContent: mockComponents.TooltipContent,
  TooltipTrigger: mockComponents.TooltipTrigger
}));
jest.mock('@/components/ui/scroll-area', () => mockComponents.ScrollArea);
jest.mock('@/components/ui/calendar', () => mockComponents.Calendar);
jest.mock('@/components/ui/checkbox', () => mockComponents.Checkbox);
jest.mock('@/components/ui/skeleton', () => mockComponents.Skeleton);
jest.mock('@/components/ui/form', () => mockComponents);

// Mock Lucide Icons
jest.mock('lucide-react', () => ({
  ArrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'arrow-right-icon'
    }, 
    React.createElement('path', {
      d: 'M0 0h24v24H0z'
    })
    )
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'check-icon'
    }, 
    React.createElement('path', {
      d: 'M0 0h24v24H0z'
    })
    )
  ),
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'clock-icon'
    }, 
    React.createElement('path', {
      d: 'M0 0h24v24H0z'
    })
    )
  ),
  AlertTriangle: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'alert-triangle-icon'
    }, 
    React.createElement('path', {
      d: 'M0 0h24v24H0z'
    })
    )
  ),
  RefreshCw: (props: React.SVGProps<SVGSVGElement>) => (
    React.createElement('svg', {
      ...props,
      'data-testid': 'refresh-cw-icon'
    }, 
    React.createElement('path', {
      d: 'M0 0h24v24H0z'
    })
    )
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

// Mock Intersection Observer
global.IntersectionObserver = class MockIntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    // Mock constructor implementation
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
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

// Mock Next.js router
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
    DATA_CLONE_ERR: 25,
  };

  class DOMExceptionImpl extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'Error';
      this.message = message || '';
    }
  }

  // Add static properties to constructor
  Object.entries(DOMExceptionCodes).forEach(([key, value]) => {
    (DOMExceptionImpl as any)[key] = value;
  });

  global.DOMException = DOMExceptionImpl as any;
}
