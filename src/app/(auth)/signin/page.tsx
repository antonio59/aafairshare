import { redirect } from 'next/navigation'

import { SignInForm } from '@/components/auth/sign-in-form'
import { createClient } from '@/lib/supabase/server'

// Import CSS from an external file instead of using styled-jsx
import '@/app/(auth)/signin/signin.css'

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Get the redirect URL from query parameters
  const redirectTo = searchParams?.redirect || '/dashboard';
  
  // Create supabase client - make sure to await the createClient function
  const supabase = await createClient();

  // Check if user is already authenticated
  const { data: { session } } = await supabase.auth.getSession()

  // If already signed in, redirect to the intended destination
  if (session) {
    redirect(typeof redirectTo === 'string' ? redirectTo : '/dashboard')
  }

  return (
    <div className="signin-container">
      {/* Left panel - visible on medium screens and above */}
      <div className="left-panel">
        <div>
          <div className="left-panel-header">
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
            <span className="logo-text">AAFairShare</span>
          </div>
          
          <h2 className="hero-title">Split expenses effortlessly.</h2>
          <p className="hero-subtitle">
            Track expenses, settle debts, and maintain friendships with our easy-to-use expense sharing app.
          </p>
        </div>
        
        <div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <div>
              <h3 className="feature-title">Secure by design</h3>
              <p className="feature-description">Your financial data is always protected</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="feature-title">Save time</h3>
              <p className="feature-description">Manage expenses in seconds, not minutes</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right panel - Sign in form */}
      <div className="right-panel">
        <div className="form-container">
          {/* Mobile logo - shown on small screens */}
          <div className="mobile-logo">
            <div className="mobile-logo-container">
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
                className="mobile-logo-icon"
              >
                <line x1="3" x2="21" y1="22" y2="22" />
                <line x1="6" x2="6" y1="18" y2="11" />
                <line x1="10" x2="10" y1="18" y2="11" />
                <line x1="14" x2="14" y1="18" y2="11" />
                <line x1="18" x2="18" y1="18" y2="11" />
                <polygon points="12 2 20 7 4 7" />
              </svg>
              <span className="mobile-logo-text">AAFairShare</span>
            </div>
          </div>
          
          <div className="card">
            <div className="header">
              <h1>Welcome back</h1>
              <p>Sign in to your account to continue</p>
            </div>
            
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  )
}