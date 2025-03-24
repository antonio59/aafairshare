import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

import type { CookieOptions } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Clone the request headers and create a new response
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-url', request.url);
  
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  try {
    // Create Supabase client with strict error handling
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // This is used to set cookies from Supabase auth
            response.cookies.set({
              name,
              value,
              ...options,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              httpOnly: true,
              path: '/'
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              expires: new Date(0),
              path: '/'
            });
          },
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );

    // Get user session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Auth error in middleware:', error.message);
      // Clear problematic auth cookies on error
      response.cookies.set({
        name: 'sb-auth-token',
        value: '',
        expires: new Date(0),
        path: '/'
      });
    }

    // Static public assets - always allow
    if (request.nextUrl.pathname.startsWith('/_next') || 
        request.nextUrl.pathname.startsWith('/public') ||
        request.nextUrl.pathname.startsWith('/favicon.ico')) {
      return response;
    }

    // Define public and auth routes
    const authRoutes = [
      '/signin',
      '/signup',
      '/reset-password',
    ];

    // Check if we're on an auth route or the root path
    const isAuthRoute = authRoutes.some(route => 
      request.nextUrl.pathname === route || 
      request.nextUrl.pathname.startsWith(`${route}/`)
    );
    
    const isPublicRoute = isAuthRoute || request.nextUrl.pathname === '/';

    // Define app route groups
    const isRouteGroup = request.nextUrl.pathname.startsWith('/(auth)') || 
                         request.nextUrl.pathname.startsWith('/(protected)');

    // Handle route groups correctly - don't try to render them directly
    if (isRouteGroup) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    // Root path redirects
    if (request.nextUrl.pathname === '/') {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/signin', request.url));
      }
    }

    // If user is not signed in and the current path is not public, redirect to signin
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/signin', request.url);
      // Add the original URL as a query param to redirect back after login
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // For auth pages, redirect to dashboard if already authenticated
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add auth info to headers for client components to access
    requestHeaders.set('x-is-authenticated', session ? 'true' : 'false');
    
    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    // Don't break the app, just continue without auth checks in case of errors
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image).*)',
  ],
};