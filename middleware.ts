import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require auth
const PUBLIC_PATHS = [
  '/', '/about', '/contact', '/services',
  '/properties', '/auth', '/unauthorized', '/api/auth',
  '/api/service-requests', // allow guest service requests
  '/api/agents',           // allow public agent data
  '/_next', '/images', '/favicon.ico',
  '/dashboard/requests/new', // guests can submit requests
];

// Role-restricted paths
const ADMIN_PATHS = ['/admin'];
const AGENT_PATHS = ['/agent'];
const AUTH_PATHS = ['/dashboard', '/admin', '/agent'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p =>
    pathname === p ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/service-requests') ||
    pathname.startsWith('/api/agents') ||
    pathname.startsWith('/api/properties') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname === '/dashboard/requests/new' ||
    (typeof p === 'string' && p !== '/dashboard/requests/new' && pathname.startsWith(p) && !pathname.startsWith('/dashboard/') && !pathname.startsWith('/admin') && !pathname.startsWith('/agent'))
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public and static paths
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Check if path needs auth
  const needsAuth = AUTH_PATHS.some(p => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  // Read token from cookie
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload without verification (Edge-safe)
  // Full verification happens in each API route handler
  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    const { role } = payload;

    // Role-based route protection
    if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (AGENT_PATHS.some(p => pathname.startsWith(p)) && role !== 'agent') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Forward user info to headers for server components
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.userId || '');
    response.headers.set('x-user-role', role || '');
    return response;
  } catch {
    // Invalid token — redirect to login
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
