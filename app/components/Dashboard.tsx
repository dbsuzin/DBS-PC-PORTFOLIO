'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, Building2, Wifi, WifiOff, AlertTriangle, HardDrive, 
  Clock, ChevronRight, Activity, X, ExternalLink, Smartphone, Battery
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
  lowBattery: number;
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
  batteryHealth: number | null;
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
  online: { title: 'Computadores Online', icon: Wifi, color: 'text-emerald-400' },
  stale: { title: 'Computadores Stale (1-7 dias)', icon: Clock, color: 'text-amber-400' },
  offline: { title: 'Computadores Offline', icon: WifiOff, color: 'text-red-400' },
  lowDisk: { title: 'Disco com Pouco Espaço', icon: HardDrive, color: 'text-orange-400' },
  warranty: { title: 'Garantia Vencendo (90 dias)', icon: AlertTriangle, color: 'text-yellow-400' },
  devicesOnline: { title: 'Aparelhos Online', icon: Smartphone, color: 'text-emerald-400' },
  devicesStale: { title: 'Aparelhos Stale (1-7 dias)', icon: Smartphone, color: 'text-amber-400' },
  devicesOffline: { title: 'Aparelhos Offline', icon: Smartphone, color: 'text-red-400' },
  lowBattery: { title: 'Bateria Baixa (≤20%)', icon: Battery, color: 'text-orange-400' },
  deviceWarranty: { title: 'Garantia Aparelhos (90 dias)', icon: AlertTriangle, color: 'text-yellow-400' },
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

  const statCards = [
    { label: 'Total PCs', value: stats.totalComputers, filter: 'all', icon: Monitor, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Online', value: stats.online, filter: 'online', icon: Wifi, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Stale (1-7d)', value: stats.stale, filter: 'stale', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Offline', value: stats.offline, filter: 'offline', icon: WifiOff, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Disco Baixo', value: stats.lowDisk, filter: 'lowDisk', icon: HardDrive, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Garantia (90d)', value: stats.warrantyExpiring, filter: 'warranty', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Total Aparelhos', value: stats.totalDevices, filter: 'all', icon: Smartphone, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Aparelhos Online', value: stats.devicesOnline, filter: 'devicesOnline', icon: Smartphone, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Aparelhos Stale', value: stats.devicesStale, filter: 'devicesStale', icon: Smartphone, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Aparelhos Offline', value: stats.devicesOffline, filter: 'devicesOffline', icon: Smartphone, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Bateria Baixa', value: stats.lowBattery, filter: 'lowBattery', icon: Battery, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Garantia Aparelhos', value: stats.deviceWarrantyExpiring, filter: 'deviceWarranty', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            onClick={() => handleCardClick(card.filter)}
            className={`card p-4 text-center transition-all hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer ${activeFilter === card.filter ? 'border-sky-500/40 shadow-lg shadow-sky-500/10' : ''}`}
          >
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Distribuição SO Aparelhos</h3>
          <div className="space-y-2">
            {stats.deviceOsDistribution.slice(0, 5).map((item) => (
              <div key={item.os} className="flex items-center gap-2 text-xs">
                <div className="flex-1 truncate text-zinc-400">{item.os}</div>
                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${(item.count / stats.totalDevices) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-right text-zinc-500">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Últimos Aparelhos Atualizados</h3>
          <div className="space-y-1">
            {stats.recentDevices.map((device) => (
              <div key={device.name} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-zinc-900/50 text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-3.5 w-3.5 text-purple-400" />
                  <span className="font-medium">{device.name}</span>
                  <span className="text-zinc-500">{device.manufacturer} {device.model}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500">
                  <span>{new Date(device.lastSeen).toLocaleDateString('pt-BR')}</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
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

      {activeFilter && FILTER_LABELS[activeFilter] && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setActiveFilter(null)}>
          <div className="modal card w-full max-w-4xl max-h-[85vh] overflow-auto p-6 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                {React.createElement(FILTER_LABELS[activeFilter].icon, { className: `h-5 w-5 ${FILTER_LABELS[activeFilter].color}` })}
                <h3 className="text-xl font-semibold glow-text">{FILTER_LABELS[activeFilter].title}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{filteredTotal} total</span>
              </div>
              <button onClick={() => setActiveFilter(null)}><X className="h-5 w-5" /></button>
            </div>

            {loadingFilter ? (
              <div className="py-16 text-center">
                <Activity className="mx-auto h-6 w-6 text-sky-400 animate-pulse mb-3" />
                <p className="text-sm text-zinc-400">Carregando...</p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-sm">
                Nenhum item encontrado.
              </div>
            ) : (
              <div className="space-y-5">
                {filteredGroups.map((group) => (
                  <div key={group.company.id}>
                    <button
                      onClick={() => handleSelectComputer(group.company.id)}
                      className="flex items-center gap-2 mb-2 group/company hover:text-sky-400 transition-colors"
                    >
                      <Building2 className="h-4 w-4 text-sky-400" />
                      <span className="font-semibold text-sm">{group.company.name}</span>
                      <span className="text-xs text-zinc-500">
                        ({group.computers.length} PC{group.computers.length > 1 ? 's' : ''}
                        {group.devices.length > 0 ? `, ${group.devices.length} Aparelho${group.devices.length > 1 ? 's' : ''}` : ''})
                      </span>
                      <ExternalLink className="h-3 w-3 text-zinc-600 group-hover/company:text-sky-400 transition-colors" />
                    </button>
                    <div className="ml-6 border-l border-zinc-800 pl-3 space-y-1">
                      {group.computers.map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => handleSelectComputer(group.company.id)}
                          className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-zinc-900/50 text-xs text-left transition-colors group/row"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Monitor className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                            <span className="font-medium truncate">{comp.hostname}</span>
                            <span className="text-zinc-500 truncate hidden sm:inline">{comp.manufacturer} {comp.model}</span>
                            {comp.ipAddress && <span className="font-mono text-zinc-600 hidden md:inline">{comp.ipAddress}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                            {activeFilter === 'lowDisk' && comp.disks && (
                              <span className="text-orange-400/80 text-[10px] max-w-[180px] truncate hidden lg:inline">{comp.disks}</span>
                            )}
                            {activeFilter === 'warranty' && comp.warrantyExpiry && (
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
                          className="w-full flex items-center justify-between py-1.5 px-2 rounded hover:bg-zinc-900/50 text-xs text-left transition-colors group/row"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Smartphone className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                            <span className="font-medium truncate">{device.name}</span>
                            <span className="text-zinc-500 truncate hidden sm:inline">{device.manufacturer} {device.model}</span>
                            {device.ipAddress && <span className="font-mono text-zinc-600 hidden md:inline">{device.ipAddress}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 flex-shrink-0">
                            {activeFilter === 'lowBattery' && device.batteryHealth != null && (
                              <span className="text-orange-400/80 text-[10px]">{device.batteryHealth}%</span>
                            )}
                            {activeFilter === 'deviceWarranty' && device.warrantyExpiry && (
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
