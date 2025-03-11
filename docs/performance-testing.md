# Performance Testing Documentation

This document outlines the performance testing approaches implemented in our application to ensure optimal speed, responsiveness, and resource usage.

## Table of Contents

1. [Overview](#overview)
2. [Performance Metrics](#performance-metrics)
3. [Testing Approaches](#testing-approaches)
   - [Custom Lighthouse Script](#custom-lighthouse-script)
   - [Web Vitals Integration](#web-vitals-integration)
   - [GitHub Actions for Lighthouse CI](#github-actions-for-lighthouse-ci)
4. [Performance Budgets](#performance-budgets)
5. [Integrating Performance Testing in Development Workflow](#integrating-performance-testing-in-development-workflow)

## Overview

We've implemented three complementary approaches to performance testing:

1. **Local Development Testing**: Using a custom Lighthouse script for direct feedback during development
2. **Production Monitoring**: Using Web Vitals to collect real user metrics in production
3. **CI/CD Integration**: Using GitHub Actions to automatically test performance on every pull request

## Performance Metrics

We track the following Core Web Vitals and performance metrics:

| Metric | Description | Target |
|--------|-------------|--------|
| LCP (Largest Contentful Paint) | Time until largest content element is visible | < 2.5s |
| FID (First Input Delay) | Time from user interaction to browser response | < 100ms |
| CLS (Cumulative Layout Shift) | Visual stability measure | < 0.1 |
| FCP (First Contentful Paint) | Time until first content is painted | < 1.8s |
| TTFB (Time to First Byte) | Time until first byte received from server | < 800ms |
| TTI (Time to Interactive) | Time until page is fully interactive | < 3.5s |

## Testing Approaches

### Custom Lighthouse Script

We've created a custom Node.js script that leverages the Lighthouse API directly:

```bash
# Test default local development server (http://localhost:5173)
npm run test:performance

# Test production build (builds, serves, tests, then cleans up)
npm run test:performance:ci

# Test a specific URL
npm run test:performance -- --url=https://example.com

# Change performance score threshold
npm run test:performance -- --threshold=90
```

**Key features:**
- HTML reports saved to the `lighthouse-reports` directory
- Configurable performance score threshold (default: 80)
- Support for testing multiple URLs
- CI-friendly output with non-zero exit code on test failure

The script is located at `scripts/run-lighthouse.js` and can be customized as needed.

### Web Vitals Integration

We've integrated the `web-vitals` library to collect real user performance metrics:

1. **Automatic Console Reporting**: Core Web Vitals are automatically logged to the browser console during development, with color-coding to highlight issues:
   - 🟢 Good values: Green
   - 🟠 Needs improvement: Orange
   - 🔴 Poor values: Red

2. **Analytics Integration**: The `reportWebVitals` function can be customized to send metrics to your analytics service:

```typescript
// In main.tsx
import { reportWebVitals } from './utils/web-vitals';

// Send metrics to analytics
reportWebVitals((metric) => {
  const { name, value } = metric;
  // Example for Google Analytics:
  // gtag('event', name, {
  //   value: Math.round(name === 'CLS' ? value * 1000 : value),
  //   metric_id: name,
  //   metric_value: value,
  // });
});
```

The Web Vitals implementation is located at `src/utils/web-vitals.ts` and follows best practices for accurate metric collection.

### GitHub Actions for Lighthouse CI

We've added a GitHub Actions workflow to automatically run Lighthouse tests on pull requests:

```yaml
# .github/workflows/lighthouse-ci.yml
name: Lighthouse CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      # ... setup steps ...
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouse-config.json'
          urls: |
            http://localhost:8080/
          uploadArtifacts: true
          temporaryPublicStorage: true
```

The Lighthouse CI configuration (`lighthouse-config.json`) sets thresholds for different metrics:

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.8}],
        "categories:accessibility": ["warn", {"minScore": 0.9}],
        "first-contentful-paint": ["warn", {"maxNumericValue": 2000}],
        // ... other metrics ...
      }
    }
  }
}
```

**Benefits:**
- Automated performance testing on every code change
- Results stored in GitHub and accessible through the Actions UI
- Pull request comments with performance impact

## Performance Budgets

We aim to meet the following performance budgets:

- Total bundle size: < 250kb (gzipped)
- First Contentful Paint: < 1.8s on 4G connection
- Time to Interactive: < 3.5s on 4G connection
- Lighthouse Performance Score: > 90

## Integrating Performance Testing in Development Workflow

### When to Run Performance Tests

1. **During Development**:
   - Use `npm run test:performance` to test changes locally
   - Check console for Web Vitals metrics during development

2. **Before Pull Request**:
   - Run `npm run test:performance:ci` to ensure production build meets thresholds

3. **Continuous Integration**:
   - GitHub Actions automatically runs Lighthouse tests
   - Review results and address any regressions

### Analyzing Results

1. **Lighthouse Report Analysis**:
   - Review opportunities and diagnostics sections
   - Focus on actionable items with high potential impact

2. **Web Vitals Monitoring**:
   - Watch for regressions in core metrics
   - Pay special attention to CLS during UI development

3. **Bundle Size Monitoring**:
   - Keep an eye on the total JavaScript bundle size
   - Use code splitting for large dependencies or routes

### Common Performance Issues and Solutions

| Issue | Potential Solutions |
|-------|---------------------|
| High LCP | Optimize images, implement preloading |
| Poor CLS | Set explicit dimensions for images and dynamic content |
| Slow FCP | Reduce blocking resources, optimize critical rendering path |
| Large bundle size | Code splitting, tree shaking, lazy loading |
| Slow API responses | Implement caching, optimize database queries | 