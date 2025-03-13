import * as React from 'react';

/**
 * Performance optimization utilities for improving Web Vitals
 */

/**
 * Preloads critical assets (images, fonts, etc.)
 * @param assets Array of URLs to preload
 */
export function preloadCriticalAssets(assets: string[]): void {
  if (typeof window === 'undefined') return;
  
  assets.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (/\.(jpe?g|png|gif|svg|webp)$/i.test(url)) {
      link.as = 'image';
    } else if (/\.(woff2?|ttf|otf|eot)$/i.test(url)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    }
    
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Dynamically loads non-critical components
 * @param Component The component to lazy load
 * @param fallback Optional fallback component to show while loading
 */
export function optimizeLCP<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    fallback?: React.ReactNode;
    priority?: boolean;
  } = {}
): React.FC<P> {
  // Return a component that won't delay LCP
  return function OptimizedComponent(props: P) {
    const [isVisible, setIsVisible] = React.useState(options.priority);
    const ref = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      if (isVisible || !ref.current) return;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      
      observer.observe(ref.current);
      return () => observer.disconnect();
    }, [isVisible]);
    
    if (!isVisible) {
      return <div ref={ref} style={{ minHeight: '20px' }}>{options.fallback}</div>;
    }
    
    return <Component {...props} />;
  };
}

/**
 * Loads stylesheets asynchronously to prevent render blocking
 * @param href URL of the stylesheet
 */
export function loadStylesheetAsync(href: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  document.head.appendChild(link);
  
  // Once the stylesheet has loaded, switch it to 'all' media
  link.onload = () => {
    link.media = 'all';
  };
}

/**
 * Defers non-critical JavaScript
 * @param src URL of the script to load
 * @param defer Whether to defer execution
 */
export function loadScriptAsync(src: string, defer = true): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    if (defer) {
      script.defer = true;
    }
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    document.body.appendChild(script);
  });
} 