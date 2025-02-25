import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  navigationType?: string;
}

interface MetricsQueue {
  metrics: PerformanceMetric[];
  lastFlush: number;
}

const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

const metricsState: MetricsQueue = {
  metrics: [],
  lastFlush: Date.now(),
};

async function flushMetrics(): Promise<void> {
  if (metricsState.metrics.length === 0) return;

  const metrics = [...metricsState.metrics];
  metricsState.metrics = [];
  metricsState.lastFlush = Date.now();

  try {
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics }),
    });
  } catch (error) {
    console.error('Failed to send metrics:', error);
    // Re-queue failed metrics
    metricsState.metrics = [...metrics, ...metricsState.metrics];
  }
}

function handleMetric(metric: PerformanceMetric): void {
  metricsState.metrics.push({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  if (metricsState.metrics.length >= BATCH_SIZE) {
    void flushMetrics();
  }
}

function initializeVitalsTracking(): void {
  onCLS(handleMetric);
  onFID(handleMetric);
  onLCP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);
}

function setupPeriodicFlush(): void {
  setInterval(() => void flushMetrics(), FLUSH_INTERVAL);
}

function setupPageHideFlush(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => void flushMetrics());
  }
}

export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;
  
  initializeVitalsTracking();
  setupPeriodicFlush();
  setupPageHideFlush();
}

export function markUserTiming(markName: string): void {
  if (typeof performance?.mark === 'function') {
    performance.mark(markName);
  }
}

export function measureUserTiming(
  measureName: string,
  startMark: string,
  endMark: string
): void {
  if (typeof performance?.measure === 'function') {
    try {
      performance.measure(measureName, startMark, endMark);
    } catch (error) {
      console.error('Error measuring performance:', error);
    }
  }
}

export function trackCustomMetric(name: string, value: number): void {
  handleMetric({
    name,
    value,
    id: `custom-${Date.now()}`,
  });
}

// Hook for component performance tracking
export function useComponentPerformance(componentName: string) {
  return {
    markMount: () => markUserTiming(`${componentName}_mount`),
    markUnmount: () => markUserTiming(`${componentName}_unmount`),
    markRender: () => markUserTiming(`${componentName}_render`),
    markUpdate: () => markUserTiming(`${componentName}_update`),
    measureRender: () => measureUserTiming(
      `${componentName}_render_duration`,
      `${componentName}_render`,
      `${componentName}_mount`
    ),
  };
}
