// Import styles first
import './index.css';

// Then React and other dependencies
import React from 'react';
import ReactDOM from 'react-dom/client';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// Then components
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { StoreProvider } from './store/StoreProvider';

// Ensure styles are applied
const applyStyles = () => {
  document.documentElement.classList.add('h-full', 'bg-gray-50');
  document.body.classList.add('h-full', 'bg-gray-50');
};

// Apply styles immediately
applyStyles();

// Performance monitoring
const reportWebVitals = ({ name, delta, id, value }: {
  name: string;
  delta: number;
  id: string;
  value: number;
}) => {
  // In production, send to analytics
  if (process.env.NODE_ENV === 'production') {
    // Log performance metrics
    console.log({
      metric: name,
      value: Math.round(value * 100) / 100,
      delta: Math.round(delta * 100) / 100,
      id
    });
  }
};

// Add accessibility features in development
if (process.env.NODE_ENV !== 'production') {
  // Dynamic import for axe-core
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  }).catch(err => {
    console.warn('Error loading axe-core:', err);
  });
}

// Root element with improved accessibility
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Add styles but don't set role (let landmarks handle structure)
rootElement.classList.add('min-h-screen', 'bg-gray-50');

const root = ReactDOM.createRoot(rootElement);

// Render with strict mode disabled to prevent double initialization
root.render(
  <ErrorBoundary>
    <StoreProvider>
      <App />
    </StoreProvider>
  </ErrorBoundary>
);

// Initialize performance monitoring
onCLS(reportWebVitals);
onFID(reportWebVitals);
onFCP(reportWebVitals);
onLCP(reportWebVitals);
onTTFB(reportWebVitals);
