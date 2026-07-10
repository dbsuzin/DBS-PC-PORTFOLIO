import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint is used by the PowerShell agent
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

    const hostname = String(computerData.hostname || '').trim();

    // Safe number parsing
    const safeNumber = (val: any) => {
      if (val === null || val === undefined || val === '') return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    // Safe date parsing (very tolerant with ISO strings like 2024-11-26T08:59:03.0000000-03:00)
    const safeDate = (val: any) => {
      if (!val || val === '') return null;
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) {
          console.log('[AGENT] Failed to parse date:', val);
          return null;
        }
        return d;
      } catch (e) {
        console.log('[AGENT] Date parse exception:', val, e);
        return null;
      }
    };

    // === SUPER ROBUST UPSERT + AUTO DEDUPLICATION ===
    const osInstallDate = safeDate(computerData.osInstallDate);
    const lastBootTime = safeDate(computerData.lastBootTime);

    console.log('[AGENT] Received dates raw:', {
      osInstallDate: computerData.osInstallDate,
      lastBootTime: computerData.lastBootTime
    });
    console.log('[AGENT] Parsed dates:', {
      osInstallDate,
      lastBootTime
    });

    const updateData = {
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
      osInstallDate,
      lastBootTime,
      ipAddress: computerData.ipAddress || null,
      disks: computerData.disks || null,
      macAddress: computerData.macAddress || null,
      biosVersion: computerData.biosVersion || null,
      notes: computerData.notes || null,
      lastSeen: new Date(),
    };

    // Find all matching computers (case-insensitive)
    const allMatches = await prisma.computer.findMany({
      where: {
        companyId: company.id,
        hostname: {
          equals: hostname,
          mode: 'insensitive'
        }
      },
      orderBy: { lastSeen: 'desc' }   // newest first
    });

    let computer;

    if (allMatches.length > 0) {
      // Use the most recently seen one as the "main" record
      const target = allMatches[0];
      
      computer = await prisma.computer.update({
        where: { id: target.id },
        data: updateData
      });

      // Delete any duplicate records (keep only the one we just updated)
      if (allMatches.length > 1) {
        const idsToDelete = allMatches.slice(1).map(m => m.id);
        await prisma.computer.deleteMany({
          where: { id: { in: idsToDelete } }
        });
        console.log(`[AGENT] Cleaned up ${idsToDelete.length} duplicate(s) for ${hostname}`);
      }
    } else {
      // No existing record → create fresh
      computer = await prisma.computer.create({
        data: {
          companyId: company.id,
          hostname: hostname,
          ...updateData
        }
      });
    }

    console.log(`[AGENT] Saved computer id=${computer.id} hostname=${hostname} with dates:`, {
      osInstallDate: computer.osInstallDate,
      lastBootTime: computer.lastBootTime
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Computador registrado/atualizado com sucesso',
      computerId: computer.id,
      company: company.name,
      datesReceived: {
        osInstallDate: computerData.osInstallDate,
        lastBootTime: computerData.lastBootTime
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Agent report error:', error);
    return NextResponse.json({ 
      error: 'Falha ao registrar computador', 
      details: error.message || String(error),
      code: error.code || 'UNKNOWN'
    }, { status: 500 });
  }
}
