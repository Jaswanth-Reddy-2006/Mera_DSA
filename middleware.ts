import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public assets and login page / auth api
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('mera_dsa_session');

  if (!session?.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decodedStr = Buffer.from(session.value, 'base64').toString('utf-8');
    // Check if session contains valid role (admin or guest) or matches legacy password token
    let isValid = false;
    try {
      const decoded = JSON.parse(decodedStr);
      if (decoded?.role === 'admin' || decoded?.role === 'guest') {
        isValid = true;
      }
    } catch {
      // Legacy string token check
      const adminToken = Buffer.from(process.env.APP_PASSWORD || 'dsa-master-password').toString('base64');
      const guestToken = Buffer.from(process.env.GUEST_PASSWORD || 'dsa-guest-password').toString('base64');
      if (session.value === adminToken || session.value === guestToken) {
        isValid = true;
      }
    }

    if (!isValid) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
