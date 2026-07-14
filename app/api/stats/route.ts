import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCompanies,
      totalComputers,
      totalDevices,
      onlineCount,
      staleCount,
      offlineCount,
      lowDiskCount,
      osDistribution,
      deviceOsDistribution,
      ramDistribution,
      recentComputers,
      recentDevices,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.computer.count({ where }),
      prisma.device.count({ where }),
      prisma.computer.count({ where: { ...where, lastSeen: { gte: oneDayAgo } } }),
      prisma.computer.count({ where: { ...where, lastSeen: { gte: sevenDaysAgo, lt: oneDayAgo } } }),
      prisma.computer.count({ where: { ...where, lastSeen: { lt: sevenDaysAgo } } }),
      prisma.computer.count({ where: { ...where, disks: { contains: 'GB livre' } } }).catch(() => 0),
      prisma.computer.groupBy({
        by: ['os'],
        where,
        _count: { os: true },
        orderBy: { _count: { os: 'desc' } },
        take: 5,
      }),
      prisma.device.groupBy({
        by: ['os'],
        where,
        _count: { os: true },
        orderBy: { _count: { os: 'desc' } },
        take: 5,
      }),
      prisma.computer.groupBy({
        by: ['ramGB'],
        where,
        _count: { ramGB: true },
        orderBy: { ramGB: 'asc' },
      }),
      prisma.computer.findMany({
        where,
        orderBy: { lastSeen: 'desc' },
        take: 5,
        select: { hostname: true, lastSeen: true, manufacturer: true, model: true },
      }),
      prisma.device.findMany({
        where,
        orderBy: { lastSeen: 'desc' },
        take: 5,
        select: { name: true, lastSeen: true, manufacturer: true, model: true },
      }),
    ]);

    const warrantyExpiring = await prisma.computer.count({
      where: {
        ...where,
        warrantyExpiry: { gte: now, lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) },
      },
    }).catch(() => 0);

    const deviceWarrantyExpiring = await prisma.device.count({
      where: {
        ...where,
        warrantyExpiry: { gte: now, lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) },
      },
    }).catch(() => 0);

    return NextResponse.json({
      totalCompanies,
      totalComputers,
      totalDevices,
      online: onlineCount,
      stale: staleCount,
      offline: offlineCount,
      lowDisk: lowDiskCount,
      warrantyExpiring,
      deviceWarrantyExpiring,
      osDistribution: osDistribution.map(o => ({ os: o.os || 'Desconhecido', count: o._count.os })),
      deviceOsDistribution: deviceOsDistribution.map(o => ({ os: o.os || 'Desconhecido', count: o._count.os })),
      ramDistribution: ramDistribution
        .filter(r => r.ramGB != null)
        .reduce((acc: { ram: number; count: number }[], r) => {
          const bucket = Math.round((r.ramGB || 0) / 4) * 4;
          const existing = acc.find(a => a.ram === bucket);
          if (existing) existing.count += r._count.ramGB;
          else acc.push({ ram: bucket, count: r._count.ramGB });
          return acc;
        }, [])
        .sort((a, b) => a.ram - b.ram)
        .slice(0, 6),
      recentComputers,
      recentDevices,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
