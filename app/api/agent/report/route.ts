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

    // Safe number parsing
    const safeNumber = (val: any) => {
      if (val === null || val === undefined || val === '') return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    // Safe date parsing
    const safeDate = (val: any) => {
      if (!val || val === '') return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    // Upsert: update existing by hostname for same company, else create
    const existing = await prisma.computer.findFirst({
      where: {
        companyId: company.id,
        hostname: computerData.hostname,
      }
    });

    let computer;
    if (existing) {
      computer = await prisma.computer.update({
        where: { id: existing.id },
        data: {
          manufacturer: computerData.manufacturer || null,
          model: computerData.model || null,
          serialNumber: computerData.serialNumber || null,
          cpu: computerData.cpu || null,
          cpuCores: safeNumber(computerData.cpuCores),
          ramGB: safeNumber(computerData.ramGB),
          diskGB: safeNumber(computerData.diskGB),
          gpu: computerData.gpu || null,
          os: computerData.os || null,
          osVersion: computerData.osVersion || null,
          osInstallDate: safeDate(computerData.osInstallDate),
          lastBootTime: safeDate(computerData.lastBootTime),
          ipAddress: computerData.ipAddress || null,
          macAddress: computerData.macAddress || null,
          biosVersion: computerData.biosVersion || null,
          notes: computerData.notes || null,
          lastSeen: new Date(),
        }
      });
    } else {
      computer = await prisma.computer.create({
        data: {
          companyId: company.id,
          hostname: computerData.hostname,
          manufacturer: computerData.manufacturer || null,
          model: computerData.model || null,
          serialNumber: computerData.serialNumber || null,
          cpu: computerData.cpu || null,
          cpuCores: safeNumber(computerData.cpuCores),
          ramGB: safeNumber(computerData.ramGB),
          diskGB: safeNumber(computerData.diskGB),
          gpu: computerData.gpu || null,
          os: computerData.os || null,
          osVersion: computerData.osVersion || null,
          osInstallDate: safeDate(computerData.osInstallDate),
          lastBootTime: safeDate(computerData.lastBootTime),
          ipAddress: computerData.ipAddress || null,
          macAddress: computerData.macAddress || null,
          biosVersion: computerData.biosVersion || null,
          notes: computerData.notes || null,
          lastSeen: new Date(),
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Computador registrado com sucesso', 
      computerId: computer.id,
      company: company.name 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Agent report error:', error);
    // Return more details for debugging (remove in production if wanted)
    return NextResponse.json({ 
      error: 'Falha ao registrar computador', 
      details: error.message || String(error),
      code: error.code || 'UNKNOWN'
    }, { status: 500 });
  }
}
