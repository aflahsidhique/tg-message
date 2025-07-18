import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'auth_token';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  res.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  });
  return res;
} 