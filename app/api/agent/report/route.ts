import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint is a simple alias to the main computers endpoint for agent use
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { apiKey, ...computerData } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key obrigatória' }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { apiKey }
    });

    if (!company) {
      return NextResponse.json({ error: 'API Key inválida' }, { status: 401 });
    }

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
        ipAddress: computerData.ipAddress || null,
        macAddress: computerData.macAddress || null,
        biosVersion: computerData.biosVersion || null,
        notes: computerData.notes || null,
        lastSeen: new Date(),
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Computador registrado com sucesso', 
      computerId: computer.id,
      company: company.name 
    }, { status: 201 });
  } catch (error) {
    console.error('Agent report error:', error);
    return NextResponse.json({ error: 'Falha ao registrar computador' }, { status: 500 });
  }
}
