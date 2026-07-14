import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const safeDate = (val: any) => {
      if (!val || val === '') return null;
      try { const d = new Date(val); return isNaN(d.getTime()) ? null : d; } catch { return null; }
    };

    const device = await prisma.device.update({
      where: { id },
      data: {
        name: body.name,
        manufacturer: body.manufacturer || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        imei: body.imei || null,
        os: body.os || null,
        osVersion: body.osVersion || null,
        storageGB: body.storageGB ? parseFloat(body.storageGB) : null,
        ramGB: body.ramGB ? parseFloat(body.ramGB) : null,
        phoneNumber: body.phoneNumber || null,
        ipAddress: body.ipAddress || null,
        macAddress: body.macAddress || null,
        notes: body.notes || null,
        purchaseDate: safeDate(body.purchaseDate),
        warrantyExpiry: safeDate(body.warrantyExpiry),
        assetTag: body.assetTag || null,
        status: body.status || 'active',
        healthStatus: body.healthStatus || 'ok',
        lastSeen: new Date(),
      }
    });

    return NextResponse.json(device);
  } catch (error: any) {
    console.error('Error updating device:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um aparelho com esse nome nesta empresa' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.device.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting device:', error);
    return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 });
  }
}
