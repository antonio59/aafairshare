declare module '@playwright/test' {
  interface TestInfo {
    page: any;
  }

  interface TestFunction {
    (testName: string, testFn: (args: { page: any }) => Promise<void>): void;
    describe: (groupName: string, groupFn: () => void) => void;
    beforeEach: (hookFn: (args: { page: any }) => Promise<void>) => void;
  }

  interface PlaywrightTestConfig {
    testDir?: string;
    fullyParallel?: boolean;
    forbidOnly?: boolean;
    retries?: number;
    workers?: string | number | undefined;
    reporter?: Array<[string, any]> | string;
    projects?: Array<PlaywrightTestConfig>;
    use?: {
      baseURL?: string;
      viewport?: {
        width: number;
        height: number;
      };
      trace?: 'on' | 'on-first-retry' | 'off';
      screenshot?: string | { mode: string };
      navigationTimeout?: number;
      actionTimeout?: number;
      video?: 'on' | 'off' | 'on-first-retry';
    };
    name?: string;
    expect?: {
      timeout?: number;
    };
  }

  interface ReporterDescription {
    name: string;
    options?: any;
  }

  const test: TestFunction;
  const expect: any;
  const devices: {
    'Desktop Chrome': {
      viewport: {
        width: number;
        height: number;
      };
    };
    'Desktop Firefox': {
      viewport: {
        width: number;
        height: number;
      };
    };
    'Desktop Safari': {
      viewport: {
        width: number;
        height: number;
      };
    };
    'Pixel 5': {
      viewport: {
        width: number;
        height: number;
      };
    };
    'iPhone 12': {
      viewport: {
        width: number;
        height: number;
      };
    };
  };

  export function defineConfig(config: PlaywrightTestConfig): PlaywrightTestConfig;
  export { test, expect, devices };
}
