'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, Building2, Wifi, WifiOff, AlertTriangle, HardDrive, 
  Clock, ChevronRight, Activity
} from 'lucide-react';

interface Stats {
  totalCompanies: number;
  totalComputers: number;
  online: number;
  stale: number;
  offline: number;
  lowDisk: number;
  warrantyExpiring: number;
  osDistribution: { os: string; count: number }[];
  ramDistribution: { ram: number; count: number }[];
  statusDistribution: { status: string; count: number }[];
  recentComputers: { hostname: string; lastSeen: string; manufacturer: string | null; model: string | null }[];
}

interface DashboardProps {
  onSelectCompany?: (id: string) => void;
}

export default function Dashboard({ onSelectCompany }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Activity className="h-6 w-6 text-sky-400 animate-pulse" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total PCs', value: stats.totalComputers, icon: Monitor, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Online', value: stats.online, icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Stale (1-7d)', value: stats.stale, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Offline', value: stats.offline, icon: WifiOff, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Disco Baixo', value: stats.lowDisk, icon: HardDrive, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Garantia (90d)', value: stats.warrantyExpiring, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="p-6 space-y-6 overflow-auto flex-1 tech-grid">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold glow-text">Dashboard</h2>
          <p className="text-sm text-zinc-400">{stats.totalCompanies} empresas cadastradas</p>
        </div>
        <button onClick={fetchStats} className="btn btn-secondary text-sm">
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="card p-4 text-center">
            <div className={`mx-auto mb-2 h-8 w-8 flex items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-[10px] text-zinc-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Distribuição por SO</h3>
          <div className="space-y-2">
            {stats.osDistribution.slice(0, 5).map((item) => (
              <div key={item.os} className="flex items-center gap-2 text-xs">
                <div className="flex-1 truncate text-zinc-400">{item.os}</div>
                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${(item.count / stats.totalComputers) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-right text-zinc-500">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Distribuição por RAM</h3>
          <div className="space-y-2">
            {stats.ramDistribution.map((item) => (
              <div key={item.ram} className="flex items-center gap-2 text-xs">
                <div className="w-16 text-zinc-400">{item.ram}GB</div>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${(item.count / stats.totalComputers) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-right text-zinc-500">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">Últimos Computadores Atualizados</h3>
        <div className="space-y-1">
          {stats.recentComputers.map((comp) => (
            <div key={comp.hostname} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-zinc-900/50 text-xs">
              <div className="flex items-center gap-2">
                <Monitor className="h-3.5 w-3.5 text-sky-400" />
                <span className="font-medium">{comp.hostname}</span>
                <span className="text-zinc-500">{comp.manufacturer} {comp.model}</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <span>{new Date(comp.lastSeen).toLocaleDateString('pt-BR')}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
