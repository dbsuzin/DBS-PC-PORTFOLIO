import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const companyId = searchParams.get('companyId');

    if (!filter) {
      return NextResponse.json({ error: 'filter inválido' }, { status: 400 });
    }

    const companyFilter: any = companyId ? { companyId } : {};

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ninetyDaysLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    if (filter === 'problems') {
      const computers = await prisma.computer.findMany({
        where: {
          ...companyFilter,
          OR: [
            { lastSeen: { gte: oneDayAgo, lt: sevenDaysAgo } },
            { lastSeen: { lt: sevenDaysAgo } },
            { disks: { contains: 'GB livre' } },
            { warrantyExpiry: { gte: now, lte: ninetyDaysLater } },
          ],
        },
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { lastSeen: 'desc' },
      });

      const grouped: Record<string, { company: { id: string; name: string }; computers: typeof computers; devices: any[] }> = {};

      for (const comp of computers) {
        const cid = comp.companyId;
        if (!grouped[cid]) {
          grouped[cid] = { company: comp.company, computers: [], devices: [] };
        }
        grouped[cid].computers.push(comp);
      }

      return NextResponse.json({ filter, total: computers.length, groups: Object.values(grouped) });
    }

    let where: any = { ...companyFilter };

    if (filter === 'offline') {
      where.lastSeen = { lt: sevenDaysAgo };
    } else if (filter === 'stale') {
      where.lastSeen = { gte: oneDayAgo, lt: sevenDaysAgo };
    } else if (filter === 'warranty') {
      where.warrantyExpiry = {
        gte: now,
        lte: ninetyDaysLater,
      };
    } else if (filter === 'lowDisk') {
      where.disks = { contains: 'GB livre' };
    } else if (filter === 'online') {
      where.lastSeen = { gte: oneDayAgo };
    } else if (filter === 'all') {
      // keep just companyFilter
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

    const grouped: Record<string, { company: { id: string; name: string }; computers: typeof computers; devices: any[] }> = {};

    for (const comp of computers) {
      const cid = comp.companyId;
      if (!grouped[cid]) {
        grouped[cid] = { company: comp.company, computers: [], devices: [] };
      }
      grouped[cid].computers.push(comp);
    }

    return NextResponse.json({ filter, total: computers.length, groups: Object.values(grouped) });
  } catch (error) {
    console.error('Error fetching filtered computers:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
