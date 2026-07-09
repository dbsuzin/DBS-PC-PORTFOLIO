import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { computers: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, contact } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Nome da empresa é obrigatório' }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        contact: contact?.trim() || null,
      },
      include: {
        _count: { select: { computers: true } }
      }
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
