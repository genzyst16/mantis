import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect routes based on authentication status and path
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  
  if (!user && !isAuthRoute) {
    // Redirect to login page if user is not authenticated and trying to access protected route
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Password Policy Check
  const isChangePasswordRoute = request.nextUrl.pathname === '/auth/change-password';
  const isSignOutRoute = request.nextUrl.pathname === '/auth/signout';
  
  if (user && !isAuthRoute && !isChangePasswordRoute && !isSignOutRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('force_password_change, password_expires_at, access_level')
      .eq('id', user.id)
      .single();
      
    if (profile) {
      const isExpired = profile.password_expires_at && new Date(profile.password_expires_at) < new Date();
      if (profile.force_password_change || isExpired) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/change-password';
        return NextResponse.redirect(url);
      }

      // Enforce access_level routing
      const accessLevel = profile.access_level ?? 'dashboard';
      const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
      const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

      if (isAdminRoute && accessLevel === 'dashboard') {
        // Dashboard-only users cannot access /admin
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }

      if (isDashboardRoute && accessLevel === 'admin') {
        // Admin-only users cannot access /dashboard
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
    }
  }

  if (user && isAuthRoute) {
    // Redirect authenticated users away from login - send to appropriate home
    const { data: profile } = await supabase
      .from('profiles')
      .select('access_level')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    const accessLevel = profile?.access_level ?? 'dashboard';
    url.pathname = accessLevel === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
