import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { supabase } from './core/api/supabase';

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