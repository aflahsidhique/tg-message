import { NextRequest, NextResponse } from 'next/server';

const USERNAME = 'admin';
const PASSWORD = 'password123';
const AUTH_COOKIE = 'auth_token';
const ONE_HOUR = 60 * 60;

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (username === USERNAME && password === PASSWORD) {
      const token = generateToken();
      const res = NextResponse.json({ success: true, message: 'Login successful' });
      res.cookies.set(AUTH_COOKIE, token, {
        httpOnly: true,
        maxAge: ONE_HOUR,
        path: '/',
        sameSite: 'lax',
      });
      return res;
    } else {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
} 