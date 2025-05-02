import { type NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// This middleware ensures users are authenticated for protected routes
// and redirects unauthenticated users to the login page
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Check if the user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/signup', '/forgot-password', '/auth/callback'];
  const isAuthPage = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
  
  // Redirect flows
  if (!session && !isAuthPage) {
    // If the user is not signed in and the requested page is not a public page,
    // redirect to the login page
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  if (session && isAuthPage) {
    // If the user is signed in and the requested page is a public page,
    // redirect to the dashboard
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes except for static files, api routes, and other exceptions
    '/((?!_next/static|_next/image|favicon.ico|api/|images/|assets/).*)',
  ],
}; 