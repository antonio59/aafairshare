import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  navigationType?: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsQueue: PerformanceMetric[] = [];
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.initializeVitalsTracking();
    this.setupPeriodicFlush();
    this.setupPageHideFlush();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeVitalsTracking(): void {
    getCLS(this.handleMetric.bind(this));
    getFID(this.handleMetric.bind(this));
    getLCP(this.handleMetric.bind(this));
    getFCP(this.handleMetric.bind(this));
    getTTFB(this.handleMetric.bind(this));
  }

  private handleMetric(metric: PerformanceMetric): void {
    this.metricsQueue.push({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      navigationType: metric.navigationType
    });

    if (this.metricsQueue.length >= this.BATCH_SIZE) {
      this.flushMetrics();
    }
  }

  private setupPeriodicFlush(): void {
    setInterval(() => this.flushMetrics(), this.FLUSH_INTERVAL);
  }

  private setupPageHideFlush(): void {
    window.addEventListener('pagehide', () => this.flushMetrics());
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsQueue.length === 0) return;

    const metrics = [...this.metricsQueue];
    this.metricsQueue = [];

    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
      // Re-queue failed metrics
      this.metricsQueue = [...metrics, ...this.metricsQueue];
    }
  }

  public markUserTiming(markName: string): void {
    if (performance.mark) {
      performance.mark(markName);
    }
  }

  public measureUserTiming(measureName: string, startMark: string, endMark: string): void {
    if (performance.measure) {
      try {
        performance.measure(measureName, startMark, endMark);
      } catch (e) {
        console.error('Error measuring performance:', e);
      }
    }
  }

  public trackCustomMetric(name: string, value: number): void {
    this.handleMetric({
      name,
      value,
      id: `custom-${Date.now()}`,
    });
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
