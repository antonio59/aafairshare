import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Create a response object that we can modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie for the response with full options
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie from the response
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0
          });
        },
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    // If there's an auth error but we're already on an auth page, just continue
    if (error && ["/signin", "/signup"].includes(pathname)) {
      return response;
    }

    // If user is signed in and tries to access auth pages, redirect to /expenses
    if (user && ["/signin", "/signup"].includes(pathname)) {
      return NextResponse.redirect(new URL("/expenses", request.url));
    }

    // If user is not signed in and tries to access protected pages, redirect to /signin
    if (!user && !["/signin", "/signup"].includes(pathname)) {
      // Clear any invalid auth cookies
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    return response;
  } catch (err) {
    console.error('Middleware error:', err);
    // Only clear cookies and redirect if not already on an auth page
    if (!["/signin", "/signup"].includes(pathname)) {
      response.cookies.delete("sb-access-token");
      response.cookies.delete("sb-refresh-token");
      return NextResponse.redirect(new URL("/signin", request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 