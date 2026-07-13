import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.APP_PASSWORD || 'pc-portfolio-secret-change-me';

function verifyToken(token: string): boolean {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('pc-portfolio-auth');

  if (request.nextUrl.pathname.startsWith('/api/agent') ||
      request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api')) {
    if (!authCookie || !verifyToken(authCookie.value)) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
  }

  if (!authCookie || !verifyToken(authCookie.value)) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
