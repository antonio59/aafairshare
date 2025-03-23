import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { jest } from '@jest/globals';

// Mock localStorage
class MockStorage implements Storage {
  private storage: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }

  clear(): void {
    this.storage = {};
  }

  key(index: number): string | null {
    return Object.keys(this.storage)[index] || null;
  }

  get length(): number {
    return Object.keys(this.storage).length;
  }
}

const localStorageMock = new MockStorage();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock matchMedia with proper MediaQueryList implementation
class MockMediaQueryList implements MediaQueryList {
  matches: boolean = false;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;

  constructor(query: string) {
    this.media = query;
  }

  addListener = jest.fn();
  removeListener = jest.fn();
  addEventListener = jest.fn();
  removeEventListener = jest.fn();

  dispatchEvent(event: MediaQueryListEvent): boolean {
    return true;
  }
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn((query: string) => new MockMediaQueryList(query))
});

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();

  takeRecords(): IntersectionObserverEntry[] {
    // Create mock DOMRectReadOnly objects
    const boundingClientRect = new DOMRect(0, 0, 100, 100);
    const intersectionRect = new DOMRect(0, 0, 50, 50);
    const rootBounds = this.root ? new DOMRect(0, 0, 800, 600) : null;

    return [{
      time: 0,
      rootBounds,
      boundingClientRect,
      intersectionRect,
      isIntersecting: false,
      intersectionRatio: 0,
      target: document.createElement('div')
    }];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver
});

// Mock ResizeObserver
class MockResizeObserver implements ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver
});

// Mock window animation and scroll functions
window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => window.setTimeout(callback, 0));
window.cancelAnimationFrame = jest.fn((handle: number) => window.clearTimeout(handle));
window.scrollTo = jest.fn();
window.scrollBy = jest.fn();
window.scroll = jest.fn();

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost',
    pathname: '/',
    search: '',
    hash: '',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    origin: 'http://localhost',
    assign: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn()
  }
});

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    pushState: jest.fn(),
    replaceState: jest.fn(),
    go: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    length: 1,
    state: null
  }
});

// Mock window.matchMedia
window.matchMedia = ((query: string): MediaQueryList => new MockMediaQueryList(query)) as (query: string) => MediaQueryList;

// Mock window.requestIdleCallback
window.requestIdleCallback = jest.fn((callback: IdleRequestCallback) => window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 0))

// Mock window.cancelIdleCallback
window.cancelIdleCallback = jest.fn((handle: number) => window.clearTimeout(handle))

// Mock window.performance
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(),
    timing: {
      navigationStart: 0
    }
  }
});

// Mock window.fetch
window.fetch = jest.fn() as unknown as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

// Mock window.indexedDB
window.indexedDB = {
  open: jest.fn()
} as any;

// Mock window.navigator
Object.defineProperty(window.navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
});

// Mock window.requestAnimationFrame
window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => window.setTimeout(callback, 0))

// Mock window.cancelAnimationFrame
window.cancelAnimationFrame = jest.fn((handle: number) => window.clearTimeout(handle))

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock window.scrollBy
window.scrollBy = jest.fn();

// Mock window.scroll
window.scroll = jest.fn();

// Mock window.innerHeight
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  value: 768
});

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  value: 1024
});