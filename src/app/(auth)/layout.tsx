import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

// Import shared styles for all auth pages
import '@/app/(auth)/auth.css';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check auth status server-side - make sure to await the createClient function
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // If user is already authenticated, redirect to dashboard
  // This protects all auth pages collectively
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="auth-layout">
      <div className="auth-container">
        {/* Left panel - visible on medium screens and above */}
        <div className="auth-sidebar">
          <div>
            <div className="auth-logo">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="22" y2="22" />
                <line x1="6" x2="6" y1="18" y2="11" />
                <line x1="10" x2="10" y1="18" y2="11" />
                <line x1="14" x2="14" y1="18" y2="11" />
                <line x1="18" x2="18" y1="18" y2="11" />
                <polygon points="12 2 20 7 4 7" />
              </svg>
              <span className="auth-logo-text">AAFairShare</span>
            </div>
            
            <h2 className="auth-title">Split expenses effortlessly.</h2>
            <p className="auth-subtitle">
              Track expenses, settle debts, and maintain friendships with our easy-to-use expense sharing app.
            </p>
          </div>
          
          <div>
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div>
                <h3 className="auth-feature-title">Secure by design</h3>
                <p className="auth-feature-desc">Your financial data is always protected</p>
              </div>
            </div>
            
            <div className="auth-feature">
              <div className="auth-feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h3 className="auth-feature-title">Save time</h3>
                <p className="auth-feature-desc">Manage expenses in seconds, not minutes</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right panel - Auth content */}
        <div className="auth-content">
          <div className="auth-mobile-logo">
            <div className="auth-mobile-logo-container">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="auth-mobile-logo-icon"
              >
                <line x1="3" x2="21" y1="22" y2="22" />
                <line x1="6" x2="6" y1="18" y2="11" />
                <line x1="10" x2="10" y1="18" y2="11" />
                <line x1="14" x2="14" y1="18" y2="11" />
                <line x1="18" x2="18" y1="18" y2="11" />
                <polygon points="12 2 20 7 4 7" />
              </svg>
              <span className="auth-mobile-logo-text">AAFairShare</span>
            </div>
          </div>
          
          <div className="auth-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}