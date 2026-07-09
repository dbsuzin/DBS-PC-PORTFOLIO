import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const computer = await prisma.computer.update({
      where: { id },
      data: {
        hostname: body.hostname,
        manufacturer: body.manufacturer || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        cpu: body.cpu || null,
        cpuCores: body.cpuCores || null,
        ramGB: body.ramGB || null,
        diskGB: body.diskGB || null,
        gpu: body.gpu || null,
        os: body.os || null,
        osVersion: body.osVersion || null,
        osInstallDate: body.osInstallDate ? new Date(body.osInstallDate) : null,
        lastBootTime: body.lastBootTime ? new Date(body.lastBootTime) : null,
        ipAddress: body.ipAddress || null,
        macAddress: body.macAddress || null,
        biosVersion: body.biosVersion || null,
        notes: body.notes || null,
        lastSeen: new Date(),
      }
    });

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
