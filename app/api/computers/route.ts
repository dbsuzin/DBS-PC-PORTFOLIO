import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate apiKey
    const { apiKey, ...computerData } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key é obrigatória' }, { status: 401 });
    }

    // Find company by apiKey
    const company = await prisma.company.findUnique({
      where: { apiKey }
    });

    if (!company) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

    // Validate required fields
    if (!computerData.hostname) {
      return NextResponse.json({ error: 'hostname é obrigatório' }, { status: 400 });
    }

    const computer = await prisma.computer.create({
      data: {
        companyId: company.id,
        hostname: computerData.hostname,
        manufacturer: computerData.manufacturer || null,
        model: computerData.model || null,
        serialNumber: computerData.serialNumber || null,
        cpu: computerData.cpu || null,
        cpuCores: computerData.cpuCores || null,
        ramGB: computerData.ramGB || null,
        diskGB: computerData.diskGB || null,
        gpu: computerData.gpu || null,
        os: computerData.os || null,
        osVersion: computerData.osVersion || null,
        osInstallDate: computerData.osInstallDate ? new Date(computerData.osInstallDate) : null,
        lastBootTime: computerData.lastBootTime ? new Date(computerData.lastBootTime) : null,
        ipAddress: computerData.ipAddress || null,
        macAddress: computerData.macAddress || null,
        biosVersion: computerData.biosVersion || null,
        notes: computerData.notes || null,
        lastSeen: new Date(),
      }
    });

    return NextResponse.json(computer, { status: 201 });
  } catch (error) {
    console.error('Error creating computer:', error);
    return NextResponse.json({ error: 'Failed to register computer' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
    }

    const computers = await prisma.computer.findMany({
      where: { companyId },
      orderBy: { lastSeen: 'desc' }
    });

    return NextResponse.json(computers);
  } catch (error) {
    console.error('Error fetching computers:', error);
    return NextResponse.json({ error: 'Failed to fetch computers' }, { status: 500 });
  }
}
