import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`device:${ip}`, 30, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const { companyId, apiKey, ...deviceData } = body;

    let resolvedCompanyId = companyId;

    if (!resolvedCompanyId && apiKey) {
      const company = await prisma.company.findUnique({ where: { apiKey } });
      if (company) resolvedCompanyId = company.id;
    }

    if (!resolvedCompanyId) {
      return NextResponse.json({ error: 'companyId ou apiKey é obrigatório' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({ where: { id: resolvedCompanyId } });
    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    if (!deviceData.name?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const safeDate = (val: any) => {
      if (!val || val === '') return null;
      try { const d = new Date(val); return isNaN(d.getTime()) ? null : d; } catch { return null; }
    };

    const device = await prisma.device.create({
      data: {
        companyId: resolvedCompanyId,
        name: deviceData.name.trim(),
        manufacturer: deviceData.manufacturer || null,
        model: deviceData.model || null,
        serialNumber: deviceData.serialNumber || null,
        imei: deviceData.imei || null,
        os: deviceData.os || null,
        osVersion: deviceData.osVersion || null,
        storageGB: deviceData.storageGB ? parseFloat(deviceData.storageGB) : null,
        ramGB: deviceData.ramGB ? parseFloat(deviceData.ramGB) : null,
        phoneNumber: deviceData.phoneNumber || null,
        batteryHealth: deviceData.batteryHealth ? parseInt(deviceData.batteryHealth) : null,
        ipAddress: deviceData.ipAddress || null,
        macAddress: deviceData.macAddress || null,
        notes: deviceData.notes || null,
        purchaseDate: safeDate(deviceData.purchaseDate),
        warrantyExpiry: safeDate(deviceData.warrantyExpiry),
        assetTag: deviceData.assetTag || null,
        status: deviceData.status || 'active',
        lastSeen: new Date(),
      }
    });

    return NextResponse.json(device, { status: 201 });
  } catch (error: any) {
    console.error('Error creating device:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um aparelho com esse nome nesta empresa' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create device' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
    }

    const devices = await prisma.device.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}
