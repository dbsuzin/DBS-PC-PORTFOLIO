import { NextRequest, NextResponse } from 'next/server';

const APP_PASSWORD = process.env.APP_PASSWORD || 'admin123';
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.APP_PASSWORD || 'pc-portfolio-secret-change-me';

async function createToken(): Promise<string> {
  const payload = btoa(JSON.stringify({ ts: Date.now(), r: Math.random() }));

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const signature = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${payload}.${signature}`;
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
    }

    if (password !== APP_PASSWORD) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    const token = await createToken();

    const response = NextResponse.json({ success: true, message: 'Login realizado' });

    response.cookies.set('pc-portfolio-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erro no login' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('pc-portfolio-auth', '', { maxAge: 0, path: '/' });
  return response;
}
