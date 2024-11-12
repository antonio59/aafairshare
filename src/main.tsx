import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// Initialize stores immediately
import { useUserStore } from './store/userStore';
import { useExpenseStore } from './store/expenseStore';

// Pre-initialize stores
useUserStore.getState();
useExpenseStore.getState();

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
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}

// Root element with improved accessibility
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Ensure proper ARIA role
rootElement.setAttribute('role', 'application');
rootElement.setAttribute('aria-label', 'AAFairShare Application');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Initialize performance monitoring
onCLS(reportWebVitals);
onFID(reportWebVitals);
onFCP(reportWebVitals);
onLCP(reportWebVitals);
onTTFB(reportWebVitals);
