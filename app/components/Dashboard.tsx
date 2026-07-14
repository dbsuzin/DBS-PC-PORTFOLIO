'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, Building2, AlertTriangle, 
  ChevronRight, Activity, X, ExternalLink, Smartphone,
  Server, Cpu
} from 'lucide-react';

interface Stats {
  totalCompanies: number;
  totalComputers: number;
  totalDevices: number;
  online: number;
  stale: number;
  offline: number;
  devicesOnline: number;
  devicesStale: number;
  devicesOffline: number;
  lowDisk: number;
  warrantyExpiring: number;
  deviceWarrantyExpiring: number;
  osDistribution: { os: string; count: number }[];
  deviceOsDistribution: { os: string; count: number }[];
  ramDistribution: { ram: number; count: number }[];
  statusDistribution: { status: string; count: number }[];
  deviceStatusDistribution: { status: string; count: number }[];
  recentComputers: { hostname: string; lastSeen: string; manufacturer: string | null; model: string | null }[];
  recentDevices: { name: string; lastSeen: string; manufacturer: string | null; model: string | null }[];
}

interface FilteredComputer {
  id: string;
  hostname: string;
  manufacturer: string | null;
  model: string | null;
  lastSeen: string;
  disks: string | null;
  diskGB: number | null;
  warrantyExpiry: string | null;
  ipAddress: string | null;
  company: { id: string; name: string };
}

interface FilteredDevice {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
  lastSeen: string;
  warrantyExpiry: string | null;
  ipAddress: string | null;
  company: { id: string; name: string };
}

interface FilterGroup {
  company: { id: string; name: string };
  computers: FilteredComputer[];
  devices: FilteredDevice[];
}

interface DashboardProps {
  onSelectCompany: (companyId: string) => void;
}

const FILTER_LABELS: Record<string, { title: string; icon: any; color: string }> = {
  problems: { title: 'Problemas Encontrados', icon: AlertTriangle, color: 'text-red-400' },
};

export default function Dashboard({ onSelectCompany }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filteredGroups, setFilteredGroups] = useState<FilterGroup[]>([]);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [loadingFilter, setLoadingFilter] = useState(false);

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

  const handleCardClick = async (filter: string) => {
    if (filter === 'all') return;
    setActiveFilter(filter);
    setLoadingFilter(true);
    setFilteredGroups([]);

    try {
      const res = await fetch(`/api/stats/filtered?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setFilteredGroups(data.groups || []);
        setFilteredTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching filtered:', error);
    } finally {
      setLoadingFilter(false);
    }
  };

  const handleSelectComputer = (companyId: string) => {
    onSelectCompany(companyId);
    setActiveFilter(null);
  };

  const formatLastSeen = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Activity className="h-6 w-6 text-sky-400 animate-pulse" />
      </div>
    );
  }

  if (!stats) return null;

  const totalProblems = stats.stale + stats.offline + stats.lowDisk + stats.warrantyExpiring + stats.devicesStale + stats.devicesOffline + stats.deviceWarrantyExpiring;

  return (
    <div className="p-6 space-y-8 overflow-auto flex-1 tech-grid">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold glow-text text-zinc-100">Dashboard</h2>
            <p className="text-sm text-zinc-400">{stats.totalCompanies} empresas cadastradas</p>
          </div>
        </div>
        <button onClick={fetchStats} className="btn btn-secondary text-sm">
          Atualizar
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => handleCardClick('all')}
          className="card stat-card stat-card-blue p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-sky-500/15 flex items-center justify-center group-hover:bg-sky-500/25 transition-colors">
              <Monitor className="h-5 w-5 text-sky-400" />
            </div>
            <span className="text-xs font-medium text-sky-400/80 bg-sky-500/10 px-2.5 py-1 rounded-full">Computadores</span>
          </div>
          <div className="text-4xl font-bold text-zinc-100 mb-1">{stats.totalComputers}</div>
          <div className="text-sm text-zinc-400">Total de computadores</div>
        </div>

        <div
          onClick={() => handleCardClick('all')}
          className="card stat-card stat-card-purple p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
              <Smartphone className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-purple-400/80 bg-purple-500/10 px-2.5 py-1 rounded-full">Aparelhos</span>
          </div>
          <div className="text-4xl font-bold text-zinc-100 mb-1">{stats.totalDevices}</div>
          <div className="text-sm text-zinc-400">Total de dispositivos</div>
        </div>

        <div
          onClick={() => handleCardClick('problems')}
          className="card stat-card stat-card-red p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center group-hover:bg-red-500/25 transition-colors">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-xs font-medium text-red-400/80 bg-red-500/10 px-2.5 py-1 rounded-full">Atenção</span>
          </div>
          <div className="text-4xl font-bold text-zinc-100 mb-1">{totalProblems}</div>
          <div className="text-sm text-zinc-400">Problemas encontrados</div>
        </div>
      </div>

      {/* Distribution Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="section-header">
            <Server className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Distribuição por SO</h3>
          </div>
          <div className="space-y-3">
            {stats.osDistribution.slice(0, 5).map((item) => (
              <div key={item.os} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{item.os}</span>
                  <span className="text-zinc-500">{item.count} ({Math.round((item.count / stats.totalComputers) * 100)}%)</span>
                </div>
                <div className="dist-bar">
                  <div
                    className="dist-bar-fill bg-gradient-to-r from-sky-500 to-cyan-400"
                    style={{ width: `${(item.count / stats.totalComputers) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="section-header">
            <Cpu className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Distribuição por RAM</h3>
          </div>
          <div className="space-y-3">
            {stats.ramDistribution.map((item) => (
              <div key={item.ram} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{item.ram}GB</span>
                  <span className="text-zinc-500">{item.count} ({Math.round((item.count / stats.totalComputers) * 100)}%)</span>
                </div>
                <div className="dist-bar">
                  <div
                    className="dist-bar-fill bg-gradient-to-r from-sky-500 to-cyan-400"
                    style={{ width: `${(item.count / stats.totalComputers) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="section-header">
            <Smartphone className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Distribuição SO Aparelhos</h3>
          </div>
          <div className="space-y-3">
            {stats.deviceOsDistribution.slice(0, 5).map((item) => (
              <div key={item.os} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{item.os}</span>
                  <span className="text-zinc-500">{item.count} ({Math.round((item.count / stats.totalDevices) * 100)}%)</span>
                </div>
                <div className="dist-bar">
                  <div
                    className="dist-bar-fill bg-gradient-to-r from-purple-500 to-violet-400"
                    style={{ width: `${(item.count / stats.totalDevices) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="section-header">
            <Smartphone className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Últimos Aparelhos Atualizados</h3>
          </div>
          <div className="space-y-1">
            {stats.recentDevices.map((device) => (
              <div key={device.name} className="recent-item">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-zinc-200 truncate">{device.name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{device.manufacturer} {device.model}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                  <span className="text-[10px]">{new Date(device.lastSeen).toLocaleDateString('pt-BR')}</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Computers */}
      <div className="card p-5">
        <div className="section-header">
          <Monitor className="h-4 w-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-zinc-200">Últimos Computadores Atualizados</h3>
        </div>
        <div className="space-y-1">
          {stats.recentComputers.map((comp) => (
            <div key={comp.hostname} className="recent-item">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                  <Monitor className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-zinc-200 truncate">{comp.hostname}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{comp.manufacturer} {comp.model}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                <span className="text-[10px]">{new Date(comp.lastSeen).toLocaleDateString('pt-BR')}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problems Modal */}
      {activeFilter && FILTER_LABELS[activeFilter] && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-6" onClick={() => setActiveFilter(null)}>
          <div className="modal card w-full max-w-4xl max-h-[85vh] overflow-auto p-6 shadow-2xl shadow-black/60" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">{FILTER_LABELS[activeFilter].title}</h3>
                  <p className="text-xs text-zinc-500">{filteredTotal} itens com problemas</p>
                </div>
              </div>
              <button onClick={() => setActiveFilter(null)} className="h-8 w-8 rounded-lg bg-zinc-800/50 flex items-center justify-center hover:bg-zinc-700/50 transition-colors">
                <X className="h-4 w-4 text-zinc-400" />
              </button>
            </div>

            {loadingFilter ? (
              <div className="py-16 text-center">
                <Activity className="mx-auto h-6 w-6 text-sky-400 animate-pulse mb-3" />
                <p className="text-sm text-zinc-400">Carregando...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-sm">
                Nenhum problema encontrado.
              </div>
            ) : (
              <div className="space-y-5">
                {filteredGroups.map((group) => (
                  <div key={group.company.id}>
                    <button
                      onClick={() => handleSelectComputer(group.company.id)}
                      className="flex items-center gap-2 mb-3 group/company hover:text-sky-400 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-sky-400" />
                      <span className="font-semibold text-sm text-zinc-200">{group.company.name}</span>
                      <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded-full">
                        {group.computers.length} PC{group.computers.length > 1 ? 's' : ''}
                        {group.devices.length > 0 ? `, ${group.devices.length} Aparelho${group.devices.length > 1 ? 's' : ''}` : ''}
                      </span>
                      <ExternalLink className="h-3 w-3 text-zinc-600 group-hover/company:text-sky-400 transition-colors" />
                    </button>
                    <div className="ml-6 border-l border-zinc-800 pl-3 space-y-1">
                      {group.computers.map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => handleSelectComputer(group.company.id)}
                          className="w-full recent-item text-left group/row"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-6 w-6 rounded-md bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                              <Monitor className="h-3 w-3 text-sky-400" />
                            </div>
                            <span className="font-medium text-xs text-zinc-200 truncate">{comp.hostname}</span>
                            <span className="text-zinc-500 text-[10px] truncate hidden sm:inline">{comp.manufacturer} {comp.model}</span>
                            {comp.ipAddress && <span className="font-mono text-zinc-600 text-[10px] hidden md:inline">{comp.ipAddress}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                            {comp.disks && (
                              <span className="text-orange-400/80 text-[10px] max-w-[180px] truncate hidden lg:inline">{comp.disks}</span>
                            )}
                            {comp.warrantyExpiry && (
                              <span className="text-yellow-400/80 text-[10px]">{new Date(comp.warrantyExpiry).toLocaleDateString('pt-BR')}</span>
                            )}
                            <span className="text-[10px]">{formatLastSeen(comp.lastSeen)}</span>
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                      {group.devices.map((device) => (
                        <button
                          key={device.id}
                          onClick={() => handleSelectComputer(group.company.id)}
                          className="w-full recent-item text-left group/row"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-6 w-6 rounded-md bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                              <Smartphone className="h-3 w-3 text-purple-400" />
                            </div>
                            <span className="font-medium text-xs text-zinc-200 truncate">{device.name}</span>
                            <span className="text-zinc-500 text-[10px] truncate hidden sm:inline">{device.manufacturer} {device.model}</span>
                            {device.ipAddress && <span className="font-mono text-zinc-600 text-[10px] hidden md:inline">{device.ipAddress}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                            {device.warrantyExpiry && (
                              <span className="text-yellow-400/80 text-[10px]">{new Date(device.warrantyExpiry).toLocaleDateString('pt-BR')}</span>
                            )}
                            <span className="text-[10px]">{formatLastSeen(device.lastSeen)}</span>
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
