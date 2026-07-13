import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// This endpoint is used by the PowerShell agent
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed } = rateLimit(`agent:${ip}`, 30, 60000);
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

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

    const TRACKED_FIELDS = ['manufacturer', 'model', 'serialNumber', 'cpu', 'cpuCores', 'ramGB', 'diskGB', 'gpu', 'os', 'osVersion', 'ipAddress', 'macAddress', 'biosVersion', 'disks'];

    if (allMatches.length > 0) {
      const target = allMatches[0];
      const existing = await prisma.computer.findUnique({ where: { id: target.id } });

      computer = await prisma.computer.update({
        where: { id: target.id },
        data: updateData
      });

      if (existing) {
        const historyEntries: { computerId: string; field: string; oldValue: string | null; newValue: string | null; changedBy: string }[] = [];
        for (const field of TRACKED_FIELDS) {
          const oldVal = existing[field as keyof typeof existing];
          const newVal = updateData[field as keyof typeof updateData];
          const oldStr = oldVal != null ? String(oldVal) : null;
          const newStr = newVal != null ? String(newVal) : null;
          if (oldStr !== newStr) {
            historyEntries.push({
              computerId: target.id,
              field,
              oldValue: oldStr,
              newValue: newStr,
              changedBy: 'agent',
            });
          }
        }
        if (historyEntries.length > 0) {
          await prisma.computerHistory.createMany({ data: historyEntries });
        }
      }

      if (allMatches.length > 1) {
        const idsToDelete = allMatches.slice(1).map(m => m.id);
        await prisma.computer.deleteMany({
          where: { id: { in: idsToDelete } }
        });
        console.log(`[AGENT] Cleaned up ${idsToDelete.length} duplicate(s) for ${hostname}`);
      }
    } else {
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
