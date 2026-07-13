import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRACKED_FIELDS = [
  'hostname', 'manufacturer', 'model', 'serialNumber', 'cpu', 'cpuCores',
  'ramGB', 'diskGB', 'gpu', 'os', 'osVersion', 'ipAddress', 'macAddress',
  'biosVersion', 'notes', 'purchaseDate', 'warrantyExpiry', 'assetTag', 'status'
];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.computer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Computador não encontrado' }, { status: 404 });
    }

    const safeDate = (val: any) => {
      if (!val || val === '') return null;
      try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
      } catch { return null; }
    };

    const newData: Record<string, any> = {
      hostname: body.hostname,
      manufacturer: body.manufacturer || null,
      model: body.model || null,
      serialNumber: body.serialNumber || null,
      cpu: body.cpu || null,
      cpuCores: body.cpuCores ? parseInt(body.cpuCores) : null,
      ramGB: body.ramGB ? parseFloat(body.ramGB) : null,
      diskGB: body.diskGB ? parseFloat(body.diskGB) : null,
      gpu: body.gpu || null,
      os: body.os || null,
      osVersion: body.osVersion || null,
      osInstallDate: safeDate(body.osInstallDate),
      lastBootTime: safeDate(body.lastBootTime),
      ipAddress: body.ipAddress || null,
      macAddress: body.macAddress || null,
      biosVersion: body.biosVersion || null,
      notes: body.notes || null,
      purchaseDate: safeDate(body.purchaseDate),
      warrantyExpiry: safeDate(body.warrantyExpiry),
      assetTag: body.assetTag || null,
      status: body.status || 'active',
      lastSeen: new Date(),
    };

    const historyEntries: { computerId: string; field: string; oldValue: string | null; newValue: string | null; changedBy: string }[] = [];

    for (const field of TRACKED_FIELDS) {
      const oldVal = existing[field as keyof typeof existing];
      const newVal = newData[field];
      const oldStr = oldVal != null ? String(oldVal) : null;
      const newStr = newVal != null ? String(newVal) : null;
      if (oldStr !== newStr) {
        historyEntries.push({
          computerId: id,
          field,
          oldValue: oldStr,
          newValue: newStr,
          changedBy: 'manual',
        });
      }
    }

    const computer = await prisma.computer.update({
      where: { id },
      data: newData,
    });

    if (historyEntries.length > 0) {
      await prisma.computerHistory.createMany({ data: historyEntries });
    }

    return NextResponse.json(computer);
  } catch (error) {
    console.error('Error updating computer:', error);
    return NextResponse.json({ error: 'Failed to update computer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.computer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting computer:', error);
    return NextResponse.json({ error: 'Failed to delete computer' }, { status: 500 });
  }
}
