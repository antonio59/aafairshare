# Troubleshooting

## Build Failures on macOS ARM64 (Apple Silicon) with Tailwind CSS v4

**Issue:**

The build process (`npm run build`) may fail with errors related to missing native modules, such as:

-   `Cannot find module '../lightningcss.darwin-arm64.node'`
-   `Cannot find module '@tailwindcss/oxide-darwin-arm64'`

This occurs because `npm` sometimes fails to automatically download and install the optional native dependencies required by Tailwind CSS v4 (and its underlying engine, Lightning CSS) for the macOS ARM64 architecture.

**Solution:**

Explicitly install the required optional dependencies for your platform:

```bash
npm install lightningcss-darwin-arm64@<version> --save-dev
npm install @tailwindcss/oxide-darwin-arm64@<version> --save-dev
```

Replace `<version>` with the specific version matching your installed `lightningcss` and `tailwindcss` packages respectively (check `package.json`). For example, if using `lightningcss@1.29.2` and `tailwindcss@4.1.3`:

```bash
npm install lightningcss-darwin-arm64@1.29.2 --save-dev
npm install @tailwindcss/oxide-darwin-arm64@4.1.3 --save-dev
```

After installing these packages, the `npm run build` command should succeed.
