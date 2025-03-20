import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
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
          // Set cookie for the request
          request.cookies.set(name, value);
          
          // Create new response with updated request
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          // Set cookie for the response with full options
          response.cookies.set(name, value, options);
        },
        remove(name: string) {
          // Remove cookie from the request
          request.cookies.delete(name);
          
          // Create new response with updated request
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          
          // Remove cookie from the response
          response.cookies.delete(name);
        },
      },
    }
  );

  await supabase.auth.getUser();

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