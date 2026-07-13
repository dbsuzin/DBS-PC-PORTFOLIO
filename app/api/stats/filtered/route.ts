import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let where: any = {};

    if (filter === 'offline') {
      where = { lastSeen: { lt: sevenDaysAgo } };
    } else if (filter === 'stale') {
      where = { lastSeen: { gte: oneDayAgo, lt: sevenDaysAgo } };
    } else if (filter === 'warranty') {
      where = {
        warrantyExpiry: {
          gte: now,
          lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        },
      };
    } else if (filter === 'lowDisk') {
      where = { disks: { contains: 'GB livre' } };
    } else if (filter === 'online') {
      where = { lastSeen: { gte: oneDayAgo } };
    } else if (filter === 'all') {
      where = {};
    } else {
      return NextResponse.json({ error: 'filter inválido' }, { status: 400 });
    }

    const computers = await prisma.computer.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
      },
      orderBy: { lastSeen: 'desc' },
    });

    const grouped: Record<string, { company: { id: string; name: string }; computers: typeof computers }> = {};

    for (const comp of computers) {
      const companyId = comp.companyId;
      if (!grouped[companyId]) {
        grouped[companyId] = { company: comp.company, computers: [] };
      }
      grouped[companyId].computers.push(comp);
    }

    return NextResponse.json({ filter, total: computers.length, groups: Object.values(grouped) });
  } catch (error) {
    console.error('Error fetching filtered computers:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
