import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');

    if (!filter) {
      return NextResponse.json({ error: 'filter inválido' }, { status: 400 });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const deviceFilters: Record<string, any> = {
      'devicesOnline': { lastSeen: { gte: oneDayAgo } },
      'devicesStale': { lastSeen: { gte: sevenDaysAgo, lt: oneDayAgo } },
      'devicesOffline': { lastSeen: { lt: sevenDaysAgo } },
      'lowBattery': { batteryHealth: { lte: 20, not: null } },
      'deviceWarranty': {
        warrantyExpiry: {
          gte: now,
          lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
        },
      },
    };

    if (deviceFilters[filter]) {
      const devices = await prisma.device.findMany({
        where: deviceFilters[filter],
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { lastSeen: 'desc' },
      });

      const grouped: Record<string, { company: { id: string; name: string }; computers: any[]; devices: typeof devices }> = {};
      for (const dev of devices) {
        const companyId = dev.companyId;
        if (!grouped[companyId]) {
          grouped[companyId] = { company: dev.company, computers: [], devices: [] };
        }
        grouped[companyId].devices.push(dev);
      }

      return NextResponse.json({ filter, total: devices.length, groups: Object.values(grouped) });
    }

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

    const grouped: Record<string, { company: { id: string; name: string }; computers: typeof computers; devices: any[] }> = {};

    for (const comp of computers) {
      const companyId = comp.companyId;
      if (!grouped[companyId]) {
        grouped[companyId] = { company: comp.company, computers: [], devices: [] };
      }
      grouped[companyId].computers.push(comp);
    }

    return NextResponse.json({ filter, total: computers.length, groups: Object.values(grouped) });
  } catch (error) {
    console.error('Error fetching filtered computers:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
