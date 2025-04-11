// Type declarations for the server build module

declare module '../../build/server/index.js' {
  import { EntryContext } from '@remix-run/node';
  import { RemixServer } from '@remix-run/react';
  
  // Export the build object that contains both default export and handleRequest
  const build: {
    default: EntryContext;
    handleRequest: (request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: any, loadContext: any) => Promise<Response>;
  };
  
  export default build;
}

// Also declare the absolute path version that's used as a fallback
declare module '/Users/antoniosmith/Projects/AAFairShare/build/server/index.js' {
  import { EntryContext } from '@remix-run/node';
  import { RemixServer } from '@remix-run/react';
  
  // Export the build object that contains both default export and handleRequest
  const build: {
    default: EntryContext;
    handleRequest: (request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: any, loadContext: any) => Promise<Response>;
  };
  
  export default build;
}