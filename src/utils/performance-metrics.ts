/**
 * Performance Metrics Utilities
 * 
 * This module provides tools for measuring and reporting performance metrics
 * for React 19 and Tailwind CSS 4 compatibility assessment.
 */

type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  startTime?: number;
  label: 'web-vital' | 'custom';
};

/**
 * Reports web vitals metrics to analytics or logging systems
 */
export function reportWebVitals(metric: WebVitalMetric) {
  // Log metrics to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vital]', metric);
  }
  
  // Send metrics to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to custom endpoint
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    }).catch(err => {
      console.error('Failed to report metrics:', err);
    });
  }
}

/**
 * Helper function to measure component render time
 * @param componentName Name of the component being measured
 * @returns Function to call when measurement should end
 */
export function measureRenderTime(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
    
    // Report as custom metric
    reportWebVitals({
      id: `render-${componentName}-${Date.now()}`,
      name: `render-${componentName}`,
      value: duration,
      label: 'custom',
    });
    
    return duration;
  };
}

/**
 * Tracks hydration performance for React 19 components
 * @param componentName Name of the component being measured
 */
export function trackHydrationPerformance(componentName: string) {
  // Use React 19's automatic batching for better performance
  const hydrationStart = performance.now();
  
  return {
    markHydrated: () => {
      const hydrationEnd = performance.now();
      const hydrationTime = hydrationEnd - hydrationStart;
      
      console.log(`[Hydration] ${componentName} hydrated in ${hydrationTime.toFixed(2)}ms`);
      
      reportWebVitals({
        id: `hydration-${componentName}-${Date.now()}`,
        name: `hydration-${componentName}`,
        value: hydrationTime,
        label: 'custom',
      });
      
      return hydrationTime;
    }
  };
}

/**
 * Creates a performance observer to track Core Web Vitals
 * This is useful for measuring LCP, CLS, and FID improvements with React 19
 */
export function observeCoreWebVitals() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {}; // No-op for SSR or unsupported browsers
  }
  
  try {
    // Track LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      reportWebVitals({
        id: `lcp-${Date.now()}`,
        name: 'LCP',
        value: lastEntry.startTime,
        label: 'web-vital',
      });
    });
    
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    
    // Track CLS (Cumulative Layout Shift)
    const clsObserver = new PerformanceObserver((entryList) => {
      let clsValue = 0;
      
      for (const entry of entryList.getEntries()) {
        // Use proper TypeScript interface for LayoutShift entries
        interface LayoutShiftEntry extends PerformanceEntry {
          hadRecentInput: boolean;
          value: number;
        }
        
        const layoutShiftEntry = entry as LayoutShiftEntry;
        if (!layoutShiftEntry.hadRecentInput) {
          clsValue += layoutShiftEntry.value;
        }
      }
      
      reportWebVitals({
        id: `cls-${Date.now()}`,
        name: 'CLS',
        value: clsValue,
        label: 'web-vital',
      });
    });
    
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    
    // Track FID (First Input Delay)
    const fidObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        // Use proper TypeScript interface for FirstInputDelay entries
        interface FirstInputEntry extends PerformanceEntry {
          processingStart: number;
          startTime: number;
        }
        
        const firstInputEntry = entry as FirstInputEntry;
        reportWebVitals({
          id: `fid-${Date.now()}`,
          name: 'FID',
          value: firstInputEntry.processingStart - firstInputEntry.startTime,
          label: 'web-vital',
        });
      }
    });
    
    fidObserver.observe({ type: 'first-input', buffered: true });
    
    // Return disconnect function
    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
    };
  } catch (e) {
    console.error('Error setting up performance observers:', e);
    return () => {}; // Return no-op cleanup function
  }
}
