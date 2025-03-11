import {
  onCLS,
  onFID,
  onFCP,
  onLCP,
  onTTFB,
  type Metric
} from 'web-vitals';

// Define a type for the report handler
type ReportHandler = (metric: Metric) => void;

// Define the metrics we want to track
const vitalsMetrics = ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'];

// Define threshold values for each metric (based on Google's recommendations)
const thresholds = {
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FID: { good: 100, poor: 300 },  // First Input Delay (ms)
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte (ms)
};

// Helper function to determine the rating of a metric value
const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  if (value <= thresholds[name as keyof typeof thresholds].good) return 'good';
  if (value <= thresholds[name as keyof typeof thresholds].poor) return 'needs-improvement';
  return 'poor';
};

// Format the metric value for display
const formatValue = (name: string, value: number): string => {
  // CLS has no units, other metrics are in milliseconds
  return name === 'CLS' ? value.toFixed(3) : `${Math.round(value)} ms`;
};

// Default reporter that logs to console
const defaultReporter: ReportHandler = (metric: Metric) => {
  const { name, value } = metric;
  const rating = getRating(name, value);
  const formattedValue = formatValue(name, value);
  
  // Use different console methods based on rating
  const logMethod = 
    rating === 'good' ? console.log :
    rating === 'needs-improvement' ? console.warn :
    console.error;

  logMethod(
    `%c${name}: %c${formattedValue} %c(${rating})`,
    'font-weight: bold;',
    'font-weight: normal;',
    `font-weight: bold; color: ${
      rating === 'good' ? 'green' : 
      rating === 'needs-improvement' ? 'orange' : 
      'red'
    }`
  );

  // If you want to send the metrics to an analytics service
  // sendToAnalytics({ name, value, rating });
};

// Function to send metrics to an analytics service (placeholder)
const sendToAnalytics = (
  {name, value, rating}: {name: string, value: number, rating: string}
) => {
  // This is just a placeholder for where you would implement your analytics logic
  // For example:
  // window.gtag('event', 'web_vitals', { name, value, rating });
  // or
  // navigator.sendBeacon('/analytics', JSON.stringify({name, value, rating}));
};

// Function to report all web vitals metrics
export function reportWebVitals(onReport: ReportHandler = defaultReporter): void {
  onCLS(onReport);
  onFID(onReport);
  onFCP(onReport);
  onLCP(onReport);
  onTTFB(onReport);
}

// Export a function that returns all collected metrics
export function collectWebVitals(): Promise<Record<string, Metric>> {
  return new Promise((resolve) => {
    const metrics: Record<string, Metric> = {};
    let collectedCount = 0;
    
    const handler: ReportHandler = (metric: Metric) => {
      metrics[metric.name] = metric;
      collectedCount++;
      
      // Resolve once we've collected all the metrics we care about
      // Note: Some metrics might not be available in all scenarios
      if (collectedCount >= vitalsMetrics.length || 
          // After 10 seconds, resolve with whatever we have
          setTimeout(() => resolve(metrics), 10000)) {
        resolve(metrics);
      }
    };
    
    reportWebVitals(handler);
  });
}

export default reportWebVitals; 