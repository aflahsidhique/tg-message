import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login and API login routes
  if (pathname.startsWith('/login') || pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/login|login).*)'],
}; 