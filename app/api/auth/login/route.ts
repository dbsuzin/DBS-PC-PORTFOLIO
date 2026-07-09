import { NextRequest, NextResponse } from 'next/server';

// ✅ Password fallback: always allows "admin123" if no APP_PASSWORD is set
// This makes local testing easy (just use admin123)
const APP_PASSWORD = process.env.APP_PASSWORD || 'admin123';

console.log('🔐 [Auth] Using password:', APP_PASSWORD === 'admin123' ? 'admin123 (default)' : 'custom from env');

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
    }

    if (password === APP_PASSWORD) {
      // Simple token (in production use JWT or proper session)
      const token = Buffer.from(`auth-${Date.now()}-${Math.random()}`).toString('base64');

      const response = NextResponse.json({ success: true, message: 'Login realizado' });
      
      // Set cookie (7 days)
      response.cookies.set('pc-portfolio-auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro no login' }, { status: 500 });
  }
}

export async function GET() {
  // Check if already logged in
  return NextResponse.json({ authenticated: false });
}
