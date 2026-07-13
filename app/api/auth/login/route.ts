import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const APP_PASSWORD = process.env.APP_PASSWORD || 'admin123';
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.APP_PASSWORD || 'pc-portfolio-secret-change-me';

function createToken(): string {
  const payload = Buffer.from(JSON.stringify({ ts: Date.now(), r: Math.random() })).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('hex');
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

    const token = createToken();

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
