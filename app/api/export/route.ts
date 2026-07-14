import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId é obrigatório' }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        computers: {
          orderBy: { lastSeen: 'desc' }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    // Prepare data for Excel
    const data = company.computers.map((comp: any) => ({
      'Hostname': comp.hostname,
      'Fabricante': comp.manufacturer || '',
      'Modelo': comp.model || '',
      'Número de Série': comp.serialNumber || '',
      'Processador': comp.cpu || '',
      'Núcleos': comp.cpuCores || '',
      'RAM (GB)': comp.ramGB || '',
      'Disco (GB)': comp.diskGB || '',
      'Placa de Vídeo': comp.gpu || '',
      'Sistema Operacional': comp.os || '',
      'Versão do SO': comp.osVersion || '',
      'Data Instalação SO': comp.osInstallDate 
        ? new Date(comp.osInstallDate).toLocaleDateString('pt-BR') 
        : '',
      'Última Inicialização': comp.lastBootTime 
        ? new Date(comp.lastBootTime).toLocaleString('pt-BR') 
        : '',
      'IP': comp.ipAddress || '',
      'MAC': comp.macAddress || '',
      'BIOS': comp.biosVersion || '',
      'Observações': comp.notes || '',
      'Condição': comp.healthStatus === 'critical' ? 'Crítico' : comp.healthStatus === 'attention' ? 'Atenção' : 'OK',
      'Última Atualização': new Date(comp.lastSeen).toLocaleString('pt-BR'),
      'Cadastrado em': new Date(comp.createdAt).toLocaleDateString('pt-BR'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Computadores');

    // Auto-size columns
    const maxWidth = 35;
    const colWidths: any = {};
    Object.keys(data[0] || {}).forEach(key => {
      colWidths[key] = { wch: Math.min(maxWidth, key.length + 5) };
    });
    worksheet['!cols'] = Object.values(colWidths);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `${company.name.replace(/[^a-zA-Z0-9]/g, '_')}_inventario_${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Erro ao gerar exportação' }, { status: 500 });
  }
}
