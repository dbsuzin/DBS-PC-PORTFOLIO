import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const computerId = searchParams.get('computerId');

    if (!computerId) {
      return NextResponse.json({ error: 'computerId é obrigatório' }, { status: 400 });
    }

    const history = await prisma.computerHistory.findMany({
      where: { computerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
