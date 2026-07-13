import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.APP_PASSWORD || 'pc-portfolio-secret-change-me';

async function verifyToken(token: string): Promise<boolean> {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = new TextEncoder().encode(payload);
    const sigBytes = Uint8Array.from(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return await crypto.subtle.verify('HMAC', key, sigBytes, data);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('pc-portfolio-auth');

  if (request.nextUrl.pathname.startsWith('/api/agent') ||
      request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const isValid = authCookie ? await verifyToken(authCookie.value) : false;

  if (!isValid) {
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
