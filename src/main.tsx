import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { supabase } from './core/api/supabase';
import { reportWebVitals } from './utils/web-vitals';
import { initSentry } from './core/services/sentry';

// Initialize Sentry (only enabled in production)
initSentry();

// Add a check for the Supabase connection
console.log('DEBUG: Testing Supabase connection');
supabase.auth.getSession().then(({ data, error }) => {
  console.log('DEBUG: Initial session check result:', { 
    hasSession: !!data?.session,
    hasError: !!error,
    errorMessage: error?.message
  });
}).catch(err => {
  console.error('DEBUG: Error checking initial session:', err);
});

// Suppress React DevTools message in production
if (process.env.NODE_ENV === 'production') {
  if (typeof window !== 'undefined') {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Report Web Vitals
reportWebVitals();

// If you want to send the metrics to your analytics:
// reportWebVitals((metric) => {
//   const { name, value } = metric;
//   // Send to your analytics service 
//   // Example for Google Analytics:
//   // gtag('event', name, {
//   //   value: Math.round(name === 'CLS' ? value * 1000 : value),
//   //   metric_id: name,
//   //   metric_value: value,
//   //   metric_delta: metric.delta,
//   // });
// });