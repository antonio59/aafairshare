/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  serverPlatform: "node",
  tailwind: true,
  postcss: true,
  browserNodeBuiltinsPolyfill: { modules: { crypto: true, path: true, os: true, fs: true } },
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
    v3_singleFetch: false, // Disabled to troubleshoot "No stream found" error
    v3_lazyRouteDiscovery: true,
  },
};
