import { type NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow auth routes without any checks
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip proxy if Supabase credentials not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_')) {
    // Credentials not configured yet, skip auth checks
    return response;
  }

  try {
    const { createServerClient, parseCookieHeader } = await import(
      '@supabase/ssr'
    );

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('cookie') ?? '');
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protect /checkout, /account, and /admin routes
    const protectedRoutes = ['/checkout', '/account', '/admin'];
    const isProtectedRoute = protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route),
    );

    if (isProtectedRoute && !user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
  } catch (error) {
    // Silently continue if there's an error during auth check
    // This allows development without full Supabase setup
    console.error('Proxy auth check failed:', error);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
