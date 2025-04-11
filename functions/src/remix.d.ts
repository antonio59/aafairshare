declare module '@aafairshare/remix' {
  import { RequestHandler } from 'express';
  export const remix: RequestHandler;
}

declare module '../lib/remix.js' {
  import { RequestHandler } from 'express';
  export const remix: RequestHandler;
}

declare module "../../build/server/index.js" {
  const value: any;
  export default value;
}