/**
 * lib/supabase/middleware.ts
 * Supabase session refresh helper for Next.js middleware using @supabase/ssr.
 * Must be called from middleware.ts at the project root.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Refreshes the Supabase session in middleware so server components
 * and server actions always receive a valid, up-to-date session.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use getSession instead of getUser to avoid blocking network requests to the Supabase API
  // on every middleware invocation. getSession decodes the local cookie and only makes a
  // network request if the token needs to be refreshed. This prevents Vercel 504 timeouts.
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;
  const isAppRoute = pathname.startsWith('/app');
  const isAuthRoute = pathname === '/auth/login' || pathname === '/auth/signup';

  // Protect /app routes
  if (isAppRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // Redirect away from auth routes if already logged in
  if (isAuthRoute && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    return NextResponse.redirect(url);
  }

  return response;
}
