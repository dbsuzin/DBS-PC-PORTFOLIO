import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('pc-portfolio-auth');
  
  if (request.nextUrl.pathname.startsWith('/api/agent') || 
      request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (!authCookie) {
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
