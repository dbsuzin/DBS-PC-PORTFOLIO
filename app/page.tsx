"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Building2, Monitor, Copy, Trash2, Edit2, RefreshCw, 
  X, FileSpreadsheet, HelpCircle, LogOut, LayoutDashboard, History,
  Shield, Smartphone, Battery, Signal, Columns3, Check
} from 'lucide-react';
import { toast } from 'sonner';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard';
import StatusDot from './components/StatusDot';
import HistoryModal from './components/HistoryModal';

interface Computer {
  id: string;
  hostname: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  cpu?: string;
  cpuCores?: number;
  ramGB?: number;
  diskGB?: number;
  disks?: string;
  gpu?: string;
  os?: string;
  osVersion?: string;
  osInstallDate?: string;
  lastBootTime?: string;
  ipAddress?: string;
  macAddress?: string;
  biosVersion?: string;
  notes?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  assetTag?: string;
  status?: string;
  lastSeen: string;
}

interface Device {
  id: string;
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  imei?: string;
  os?: string;
  osVersion?: string;
  storageGB?: number;
  ramGB?: number;
  phoneNumber?: string;
  batteryHealth?: number;
  ipAddress?: string;
  macAddress?: string;
  notes?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  assetTag?: string;
  status?: string;
  lastSeen: string;
}

interface Company {
  id: string;
  name: string;
  contact?: string;
  apiKey: string;
  createdAt: string;
  _count?: { computers: number };
  computers?: Computer[];
}

export default function PCPortfolio() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showComputerModal, setShowComputerModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [historyComputer, setHistoryComputer] = useState<Computer | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [computerForm, setComputerForm] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<'computers' | 'devices'>('computers');
  const [devices, setDevices] = useState<Device[]>([]);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceForm, setDeviceForm] = useState<any>({});
  const [showQRModal, setShowQRModal] = useState(false);
  const [showColConfig, setShowColConfig] = useState<'computers' | 'devices' | null>(null);

  const defaultComputerCols = ['status','hostname','manufacturer','cpu','ram','disks','os','ip','notes','lastSeen','actions'];
  const defaultDeviceCols = ['status','name','manufacturer','os','imei','storage','ram','phone','battery','devStatus','lastSeen','actions'];

  const [visibleComputerCols, setVisibleComputerCols] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pc-portfolio-computer-cols');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return defaultComputerCols;
  });
  const [visibleDeviceCols, setVisibleDeviceCols] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pc-portfolio-device-cols');
      if (saved) try { return JSON.parse(saved); } catch {}
    }
    return defaultDeviceCols;
  });

  useEffect(() => {
    localStorage.setItem('pc-portfolio-computer-cols', JSON.stringify(visibleComputerCols));
  }, [visibleComputerCols]);
  useEffect(() => {
    localStorage.setItem('pc-portfolio-device-cols', JSON.stringify(visibleDeviceCols));
  }, [visibleDeviceCols]);

  const toggleComputerCol = (col: string) => {
    setVisibleComputerCols(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };
  const toggleDeviceCol = (col: string) => {
    setVisibleDeviceCols(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  useEffect(() => {
    const handleClick = () => setShowColConfig(null);
    if (showColConfig) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showColConfig]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (autoRefresh && selectedCompany && isAuthenticated) {
      refreshIntervalRef.current = setInterval(() => {
        fetchComputers(selectedCompany.id);
        fetchDevices(selectedCompany.id);
      }, 30000);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [autoRefresh, selectedCompany, isAuthenticated]);

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    window.location.reload();
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.status === 401) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      setCompanies(data);
      setIsAuthenticated(true);
    } catch (error) {
      toast.error('Erro ao carregar empresas');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComputers = async (companyId: string) => {
    try {
      const res = await fetch(`/api/computers?companyId=${companyId}`);
      const data = await res.json();
      setComputers(data);
    } catch (error) {
      toast.error('Erro ao carregar computadores');
    }
  };

  const fetchDevices = async (companyId: string) => {
    try {
      const res = await fetch(`/api/devices?companyId=${companyId}`);
      const data = await res.json();
      setDevices(data);
    } catch (error) {
      toast.error('Erro ao carregar aparelhos');
    }
  };

  const selectCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowDashboard(false);
    setActiveTab('computers');
    setSearchTerm('');
    fetchComputers(company.id);
    fetchDevices(company.id);
  };

  const exportToExcel = async () => {
    if (!selectedCompany) return;

    try {
      const res = await fetch(`/api/export?companyId=${selectedCompany.id}`);
      if (!res.ok) throw new Error('Falha na exportação');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCompany.name.replace(/\s+/g, '_')}_inventario.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Arquivo Excel gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar para Excel');
    }
  };

  const openCompanyModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({ name: company.name, contact: company.contact || '' });
    } else {
      setEditingCompany(null);
      setFormData({ name: '', contact: '' });
    }
    setShowCompanyModal(true);
  };

  const saveCompany = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da empresa é obrigatório');
      return;
    }

    try {
      let res;
      if (editingCompany) {
        res = await fetch(`/api/companies/${editingCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao salvar');
      }

      const savedCompany = await res.json();
      await fetchCompanies();

      if (selectedCompany && selectedCompany.id === savedCompany.id) {
        setSelectedCompany(savedCompany);
      } else if (!editingCompany) {
        setSelectedCompany(savedCompany);
        fetchComputers(savedCompany.id);
      }

      setShowCompanyModal(false);
      toast.success(editingCompany ? 'Empresa atualizada!' : 'Empresa cadastrada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar empresa');
    }
  };

  const deleteCompany = async (company: Company) => {
    if (!confirm(`Excluir empresa "${company.name}" e todos os seus computadores?`)) return;

    try {
      const res = await fetch(`/api/companies/${company.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();

      await fetchCompanies();
      if (selectedCompany?.id === company.id) {
        setSelectedCompany(null);
        setComputers([]);
      }
      toast.success('Empresa excluída');
    } catch {
      toast.error('Erro ao excluir empresa');
    }
  };

  const openComputerModal = (computer?: Computer) => {
    if (computer) {
      setEditingComputer(computer);
      setComputerForm({ ...computer });
    } else {
      setEditingComputer(null);
      setComputerForm({
        hostname: '', manufacturer: '', model: '', serialNumber: '',
        cpu: '', cpuCores: '', ramGB: '', diskGB: '', gpu: '',
        os: '', osVersion: '', osInstallDate: '', lastBootTime: '',
        ipAddress: '', macAddress: '', biosVersion: '', notes: '',
        purchaseDate: '', warrantyExpiry: '', assetTag: '', status: 'active',
      });
    }
    setShowComputerModal(true);
  };

  const saveComputer = async () => {
    if (!selectedCompany) return;
    if (!computerForm.hostname?.trim()) {
      toast.error('Hostname é obrigatório');
      return;
    }

    try {
      const payload = {
        ...computerForm,
        cpuCores: computerForm.cpuCores ? parseInt(computerForm.cpuCores) : null,
        ramGB: computerForm.ramGB ? parseFloat(computerForm.ramGB) : null,
        diskGB: computerForm.diskGB ? parseFloat(computerForm.diskGB) : null,
      };

      let res;
      if (editingComputer) {
        res = await fetch(`/api/computers/${editingComputer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/computers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, apiKey: selectedCompany.apiKey }),
        });
      }

      if (!res.ok) throw new Error(await res.text());

      await fetchComputers(selectedCompany.id);
      setShowComputerModal(false);
      toast.success(editingComputer ? 'Computador atualizado!' : 'Computador adicionido!');
    } catch (error) {
      toast.error('Erro ao salvar computador');
    }
  };

  const deleteComputer = async (comp: Computer) => {
    if (!confirm(`Excluir computador "${comp.hostname}"?`)) return;

    try {
      await fetch(`/api/computers/${comp.id}`, { method: 'DELETE' });
      if (selectedCompany) await fetchComputers(selectedCompany.id);
      toast.success('Computador removido');
    } catch {
      toast.error('Erro ao remover computador');
    }
  };

  const openDeviceModal = (device?: Device) => {
    if (device) {
      setEditingDevice(device);
      setDeviceForm({
        name: device.name,
        manufacturer: device.manufacturer || '',
        model: device.model || '',
        serialNumber: device.serialNumber || '',
        imei: device.imei || '',
        os: device.os || '',
        osVersion: device.osVersion || '',
        storageGB: device.storageGB || '',
        ramGB: device.ramGB || '',
        phoneNumber: device.phoneNumber || '',
        batteryHealth: device.batteryHealth || '',
        ipAddress: device.ipAddress || '',
        macAddress: device.macAddress || '',
        notes: device.notes || '',
        purchaseDate: device.purchaseDate ? device.purchaseDate.split('T')[0] : '',
        warrantyExpiry: device.warrantyExpiry ? device.warrantyExpiry.split('T')[0] : '',
        assetTag: device.assetTag || '',
        status: device.status || 'active',
      });
    } else {
      setEditingDevice(null);
      setDeviceForm({
        name: '', manufacturer: '', model: '', serialNumber: '', imei: '',
        os: '', osVersion: '', storageGB: '', ramGB: '', phoneNumber: '',
        batteryHealth: '', ipAddress: '', macAddress: '', notes: '',
        purchaseDate: '', warrantyExpiry: '', assetTag: '', status: 'active',
      });
    }
    setShowDeviceModal(true);
  };

  const saveDevice = async () => {
    if (!selectedCompany) return;
    if (!deviceForm.name?.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      let res;
      if (editingDevice) {
        res = await fetch(`/api/devices/${editingDevice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deviceForm),
        });
      } else {
        res = await fetch('/api/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...deviceForm, companyId: selectedCompany.id }),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao salvar');
      }

      await fetchDevices(selectedCompany.id);
      setShowDeviceModal(false);
      toast.success(editingDevice ? 'Aparelho atualizado!' : 'Aparelho adicionado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar aparelho');
    }
  };

  const deleteDevice = async (device: Device) => {
    if (!confirm(`Excluir aparelho "${device.name}"?`)) return;

    try {
      await fetch(`/api/devices/${device.id}`, { method: 'DELETE' });
      if (selectedCompany) await fetchDevices(selectedCompany.id);
      toast.success('Aparelho removido');
    } catch {
      toast.error('Erro ao remover aparelho');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '—';
    try {
      const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const formatDateOnly = (dateString?: string | Date) => {
    if (!dateString) return '—';
    try {
      const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('pt-BR');
    } catch {
      return '—';
    }
  };

  const formatGB = (gb?: number) => gb ? `${gb.toFixed(1)} GB` : '—';

  const renderDisks = (disks?: string, diskGB?: number) => {
    if (!disks) return formatGB(diskGB);
    const parts = disks.split(' + ');
    return parts.map((part, i) => {
      const freeMatch = part.match(/(\d+)GB livre/);
      if (freeMatch) {
        const freeGB = parseInt(freeMatch[1]);
        if (freeGB <= 20) {
          return <span key={i} className="text-red-400 font-semibold">{part}</span>;
        }
      }
      return <span key={i}>{part}</span>;
    }).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, ' + ', curr], [] as React.ReactNode[]);
  };

  const filteredComputers = computers.filter(c =>
    c.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.manufacturer && c.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.os && c.os.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.ipAddress && c.ipAddress.includes(searchTerm))
  );

  const filteredDevices = devices.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.manufacturer && d.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.model && d.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.imei && d.imei.includes(searchTerm)) ||
    (d.ipAddress && d.ipAddress.includes(searchTerm)) ||
    (d.os && d.os.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header - ONLY as tall as the logo */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 w-full header-line">
        <div className="w-full px-4 py-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/dbs-logo.png" alt="DBS" className="h-24 w-auto" />
            <div>
              <h1 className="font-semibold text-sm tracking-tight">PC Portfolio</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setShowDashboard(true); setSelectedCompany(null); }}
              className={`btn flex items-center gap-1.5 text-sm ${showDashboard ? 'btn-primary' : 'btn-secondary'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>

            <button 
              onClick={() => openCompanyModal()}
              className="btn btn-primary flex items-center gap-1.5 text-sm"
            >
              <Plus className="h-4 w-4" />
              Nova Empresa
            </button>

            {selectedCompany && (
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`btn text-xs px-2 py-1.5 ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
                title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
            )}

            <button 
              onClick={() => setShowHelpModal(true)}
              className="btn btn-secondary flex items-center gap-1.5 text-sm"
            >
              <HelpCircle className="h-4 w-4" />
              Ajuda
            </button>

            <button 
              onClick={handleLogout}
              className="btn btn-secondary flex items-center gap-1.5 text-sm"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 w-full min-w-0">
        {/* Sidebar - wider for readable company names */}
        <div className="w-52 border-r border-zinc-800/50 p-2 flex flex-col sidebar-glow bg-zinc-950/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-medium text-sm uppercase tracking-widest text-zinc-500">Empresas</h2>
              <p className="text-xs text-zinc-500">{companies.length} cadastradas</p>
            </div>
            <button onClick={fetchCompanies} className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-900">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6"><RefreshCw className="animate-spin h-4 w-4 text-zinc-400" /></div>
          ) : companies.length === 0 ? (
            <div className="text-center py-6 px-2 text-sm text-zinc-500">Nenhuma empresa cadastrada.</div>
          ) : (
            <div className="space-y-1 overflow-auto flex-1 pr-1">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => selectCompany(company)}
                  className={`group flex items-center justify-between rounded-xl px-2 py-2 cursor-pointer transition-all border text-sm ${
                    selectedCompany?.id === company.id 
                      ? 'bg-sky-500/10 border-sky-500/20 shadow-lg shadow-sky-500/5' 
                      : 'hover:bg-zinc-900/60 border-transparent hover:border-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0 border border-sky-500/15">
                      <Building2 className="h-3.5 w-3.5 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{company.name}</div>
                      <div className="text-xs text-zinc-500">{company._count?.computers || 0} PC(s)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={(e) => { e.stopPropagation(); openCompanyModal(company); }} className="p-0.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200">
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCompany(company); }} className="p-0.5 hover:bg-zinc-800 rounded text-red-400 hover:text-red-300">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 px-1">
            {selectedCompany && (
              <div>
                <div className="font-mono text-[9px] bg-zinc-900 px-1.5 py-0.5 rounded mb-1 truncate">{selectedCompany.apiKey}</div>
                <button onClick={() => copyToClipboard(selectedCompany.apiKey, "API Key")} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-[10px]">
                  <Copy className="h-2.5 w-2.5" /> Copiar API Key
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {showDashboard ? (
            <Dashboard onSelectCompany={(id) => {
              const company = companies.find(c => c.id === id);
              if (company) selectCompany(company);
            }} />
          ) : !selectedCompany ? (
            <div className="flex flex-1 items-center justify-center p-12 text-center tech-grid">
              <div>
                <div className="mx-auto mb-6 h-16 w-16 flex items-center justify-center rounded-2xl bg-zinc-900/80 border border-sky-500/10 shadow-lg shadow-sky-500/5">
                  <Monitor className="h-8 w-8 text-sky-400" />
                </div>
                <h3 className="font-semibold text-2xl mb-2 glow-text">Selecione uma empresa</h3>
                <p className="text-zinc-400 max-w-xs mx-auto text-sm">Escolha uma empresa na barra lateral.</p>
                <button onClick={() => openCompanyModal()} className="mt-6 btn btn-primary mx-auto">Cadastrar primeira empresa</button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-zinc-800/50 px-3 py-2 flex items-center justify-between bg-zinc-950/30">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-semibold tracking-tight glow-text">{selectedCompany.name}</h2>
                    <span className="text-xs px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">{computers.length} computadores</span>
                  </div>
                  {selectedCompany.contact && <p className="text-sm text-zinc-400 mt-0.5">{selectedCompany.contact}</p>}
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={exportToExcel} className="btn btn-secondary flex items-center gap-2 text-sm">
                    <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
                  </button>
                  <button onClick={() => openComputerModal()} className="btn btn-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Adicionar PC
                  </button>
                  <button onClick={() => fetchComputers(selectedCompany.id)} className="btn btn-secondary p-2.5">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div className="bg-zinc-900/50 border-b border-zinc-800/50 px-8 py-1.5 flex items-center justify-between text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="font-mono bg-zinc-950/80 px-3 py-1.5 rounded-lg text-xs border border-sky-500/15 text-sky-300">{selectedCompany.apiKey}</div>
                  <button onClick={() => copyToClipboard(selectedCompany.apiKey, "API Key")} className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300">
                    <Copy className="h-3.5 w-3.5" /> Copiar
                  </button>
                </div>
                <div className="text-xs text-zinc-500">Use esta chave no agente</div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-8 pt-4">
                <button
                  onClick={() => setActiveTab('computers')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'computers'
                      ? 'bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-sm shadow-sky-500/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Monitor className="h-4 w-4" /> Computadores
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === 'computers' ? 'bg-sky-500/20 text-sky-300' : 'bg-zinc-800 text-zinc-500'
                  }`}>{computers.length}</span>
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'devices'
                      ? 'bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-sm shadow-sky-500/10'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> Aparelhos
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === 'devices' ? 'bg-sky-500/20 text-sky-300' : 'bg-zinc-800 text-zinc-500'
                  }`}>{devices.length}</span>
                </button>
              </div>

              {/* Search */}
              <div className="px-8 pt-5 pb-3 flex items-center gap-4">
                <input 
                  placeholder={activeTab === 'computers' ? "Buscar por hostname, fabricante, SO ou IP..." : "Buscar por nome, modelo, IMEI ou IP..."}
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="flex-1 max-w-md" 
                />
                <div className="text-xs text-zinc-500">{activeTab === 'computers' ? `${filteredComputers.length} / ${computers.length}` : `${filteredDevices.length} / ${devices.length}`}</div>
                <div className="relative">
                  <button onClick={() => setShowColConfig(showColConfig ? null : activeTab)} className="btn btn-secondary flex items-center gap-2 text-sm" title="Configurar colunas">
                    <Columns3 className="h-4 w-4" />
                  </button>
                  {showColConfig && (
                    <div className="absolute right-0 top-full mt-2 z-50 card p-3 min-w-[200px] shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
                      <div className="text-xs font-semibold text-zinc-400 mb-2 pb-2 border-b border-zinc-800">Colunas visíveis</div>
                          {showColConfig === 'computers' ? (
                        <div className="space-y-1">
                          {[
                            { key: 'status', label: 'Status' },
                            { key: 'hostname', label: 'Hostname' },
                            { key: 'manufacturer', label: 'Fabricante/Modelo' },
                            { key: 'cpu', label: 'CPU' },
                            { key: 'ram', label: 'RAM' },
                            { key: 'disks', label: 'Disco' },
                            { key: 'os', label: 'SO / Versão' },
                            { key: 'ip', label: 'IP' },
                            { key: 'notes', label: 'Observações' },
                            { key: 'lastSeen', label: 'Atualizado' },
                            { key: 'actions', label: 'Ações' },
                          ].map(col => (
                            <label key={col.key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => toggleComputerCol(col.key)}>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${visibleComputerCols.includes(col.key) ? 'bg-sky-500 border-sky-500' : 'border-zinc-600'}`}>
                                {visibleComputerCols.includes(col.key) && <Check className="h-3 w-3 text-black" />}
                              </div>
                              <span className="text-zinc-300">{col.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {[
                            { key: 'status', label: 'Status' },
                            { key: 'name', label: 'Nome' },
                            { key: 'manufacturer', label: 'Fabricante/Modelo' },
                            { key: 'os', label: 'SO / Versão' },
                            { key: 'imei', label: 'IMEI' },
                            { key: 'storage', label: 'Armazenamento' },
                            { key: 'ram', label: 'RAM' },
                            { key: 'phone', label: 'Telefone' },
                            { key: 'battery', label: 'Bateria' },
                            { key: 'devStatus', label: 'Status Aparelho' },
                            { key: 'lastSeen', label: 'Atualizado' },
                            { key: 'actions', label: 'Ações' },
                          ].map(col => (
                            <label key={col.key} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800 cursor-pointer text-sm" onClick={() => toggleDeviceCol(col.key)}>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${visibleDeviceCols.includes(col.key) ? 'bg-sky-500 border-sky-500' : 'border-zinc-600'}`}>
                                {visibleDeviceCols.includes(col.key) && <Check className="h-3 w-3 text-black" />}
                              </div>
                              <span className="text-zinc-300">{col.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {activeTab === 'devices' && (
                  <>
                    <button onClick={() => setShowQRModal(true)} className="btn btn-secondary flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4" /> QR Code
                    </button>
                    <button onClick={() => openDeviceModal()} className="btn btn-primary flex items-center gap-2 text-sm">
                      <Plus className="h-4 w-4" /> Adicionar Aparelho
                    </button>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="px-2 pb-4 flex-1 overflow-x-auto w-full">
                {activeTab === 'computers' ? (
                  <>
                    {computers.length === 0 ? (
                      <div className="py-16 text-center border border-dashed border-zinc-800/50 rounded-2xl tech-grid">
                        <Monitor className="mx-auto mb-4 h-10 w-10 text-sky-500/40" />
                        <p className="text-lg text-zinc-400">Nenhum computador cadastrado.</p>
                        <button onClick={() => openComputerModal()} className="mt-4 btn btn-primary">Adicionar PC</button>
                      </div>
                    ) : (
                      <div className="card overflow-hidden animate-border-glow">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-left">
                              {visibleComputerCols.includes('status') && <th className="px-2 py-1.5 font-medium text-zinc-400"></th>}
                              {visibleComputerCols.includes('hostname') && <th className="px-2 py-1.5 font-medium text-zinc-400">Hostname</th>}
                              {visibleComputerCols.includes('manufacturer') && <th className="px-2 py-1.5 font-medium text-zinc-400">Fabricante/Modelo</th>}
                              {visibleComputerCols.includes('cpu') && <th className="px-2 py-1.5 font-medium text-zinc-400">CPU</th>}
                              {visibleComputerCols.includes('ram') && <th className="px-2 py-1.5 font-medium text-zinc-400">RAM</th>}
                              {visibleComputerCols.includes('disks') && <th className="px-2 py-1.5 font-medium text-zinc-400">Disco (Físico)</th>}
                              {visibleComputerCols.includes('os') && <th className="px-2 py-1.5 font-medium text-zinc-400">SO / Versão</th>}
                              {visibleComputerCols.includes('ip') && <th className="px-2 py-1.5 font-medium text-zinc-400">IP</th>}
                              {visibleComputerCols.includes('notes') && <th className="px-2 py-1.5 font-medium text-zinc-400">Observações</th>}
                              {visibleComputerCols.includes('lastSeen') && <th className="px-2 py-1.5 font-medium text-zinc-400">Atualizado</th>}
                              {visibleComputerCols.includes('actions') && <th className="px-2 py-1.5 font-medium text-right text-zinc-400">Ações</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredComputers.map((comp) => (
                              <tr key={comp.id} className="computer-row hover:bg-zinc-900/70 border-t border-zinc-800">
                                {visibleComputerCols.includes('status') && <td className="px-2 py-1"><StatusDot lastSeen={comp.lastSeen} /></td>}
                                {visibleComputerCols.includes('hostname') && <td className="px-2 py-1 font-medium whitespace-nowrap">{comp.hostname}</td>}
                                {visibleComputerCols.includes('manufacturer') && (
                                  <td className="px-2 py-1 whitespace-nowrap text-zinc-300">
                                    {comp.manufacturer ? `${comp.manufacturer} / ${comp.model || ''}` : '—'}
                                  </td>
                                )}
                                {visibleComputerCols.includes('cpu') && (
                                  <td className="px-2 py-1 whitespace-nowrap text-zinc-300">
                                    {comp.cpu ? (comp.cpuCores ? `${comp.cpu} (${comp.cpuCores})` : comp.cpu) : '—'}
                                  </td>
                                )}
                                {visibleComputerCols.includes('ram') && <td className="px-2 py-1 whitespace-nowrap">{formatGB(comp.ramGB)}</td>}
                                {visibleComputerCols.includes('disks') && (
                                  <td className="px-2 py-1 whitespace-nowrap text-[9px]">
                                    {renderDisks(comp.disks, comp.diskGB)}
                                  </td>
                                )}
                                {visibleComputerCols.includes('os') && (
                                  <td className="px-2 py-1 whitespace-nowrap text-zinc-300">
                                    {comp.os ? `${comp.os} ${comp.osVersion || ''}`.trim() : '—'}
                                  </td>
                                )}
                                {visibleComputerCols.includes('ip') && <td className="px-2 py-1 font-mono text-[9px] text-zinc-400 whitespace-nowrap">{comp.ipAddress || '—'}</td>}
                                {visibleComputerCols.includes('notes') && <td className="px-2 py-1 text-[9px] text-zinc-400 max-w-[200px] truncate" title={comp.notes || ''}>{comp.notes || '—'}</td>}
                                {visibleComputerCols.includes('lastSeen') && <td className="px-2 py-1 text-[9px] text-zinc-400 whitespace-nowrap">{formatDate(comp.lastSeen)}</td>}
                                {visibleComputerCols.includes('actions') && (
                                  <td className="px-2 py-1 text-right">
                                    <div className="flex gap-0.5 justify-end">
                                      <button onClick={() => setHistoryComputer(comp)} className="p-1 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded" title="Histórico"><History className="h-3 w-3" /></button>
                                      <button onClick={() => openComputerModal(comp)} className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded"><Edit2 className="h-3 w-3" /></button>
                                      <button onClick={() => deleteComputer(comp)} className="p-1 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {devices.length === 0 ? (
                      <div className="py-16 text-center border border-dashed border-zinc-800/50 rounded-2xl tech-grid">
                        <Smartphone className="mx-auto mb-4 h-10 w-10 text-sky-500/40" />
                        <p className="text-lg text-zinc-400">Nenhum aparelho cadastrado.</p>
                        <button onClick={() => openDeviceModal()} className="mt-4 btn btn-primary">Adicionar Aparelho</button>
                      </div>
                    ) : (
                      <div className="card overflow-hidden animate-border-glow">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-left">
                              {visibleDeviceCols.includes('status') && <th className="px-2 py-1.5 font-medium text-zinc-400"></th>}
                              {visibleDeviceCols.includes('name') && <th className="px-2 py-1.5 font-medium text-zinc-400">Nome</th>}
                              {visibleDeviceCols.includes('manufacturer') && <th className="px-2 py-1.5 font-medium text-zinc-400">Fabricante/Modelo</th>}
                              {visibleDeviceCols.includes('os') && <th className="px-2 py-1.5 font-medium text-zinc-400">SO / Versão</th>}
                              {visibleDeviceCols.includes('imei') && <th className="px-2 py-1.5 font-medium text-zinc-400">IMEI</th>}
                              {visibleDeviceCols.includes('storage') && <th className="px-2 py-1.5 font-medium text-zinc-400">Armazenamento</th>}
                              {visibleDeviceCols.includes('ram') && <th className="px-2 py-1.5 font-medium text-zinc-400">RAM</th>}
                              {visibleDeviceCols.includes('phone') && <th className="px-2 py-1.5 font-medium text-zinc-400">Telefone</th>}
                              {visibleDeviceCols.includes('battery') && <th className="px-2 py-1.5 font-medium text-zinc-400">Bateria</th>}
                              {visibleDeviceCols.includes('devStatus') && <th className="px-2 py-1.5 font-medium text-zinc-400">Status</th>}
                              {visibleDeviceCols.includes('lastSeen') && <th className="px-2 py-1.5 font-medium text-zinc-400">Atualizado</th>}
                              {visibleDeviceCols.includes('actions') && <th className="px-2 py-1.5 font-medium text-right text-zinc-400">Ações</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDevices.map((device) => (
                              <tr key={device.id} className="computer-row hover:bg-zinc-900/70 border-t border-zinc-800">
                                {visibleDeviceCols.includes('status') && <td className="px-2 py-1"><StatusDot lastSeen={device.lastSeen} /></td>}
                                {visibleDeviceCols.includes('name') && <td className="px-2 py-1 font-medium whitespace-nowrap">{device.name}</td>}
                                {visibleDeviceCols.includes('manufacturer') && (
                                  <td className="px-2 py-1 whitespace-nowrap text-zinc-300">
                                    {device.manufacturer ? `${device.manufacturer} / ${device.model || ''}` : device.model || '—'}
                                  </td>
                                )}
                                {visibleDeviceCols.includes('os') && (
                                  <td className="px-2 py-1 whitespace-nowrap text-zinc-300">
                                    {device.os ? `${device.os} ${device.osVersion || ''}`.trim() : '—'}
                                  </td>
                                )}
                                {visibleDeviceCols.includes('imei') && <td className="px-2 py-1 font-mono text-[9px] text-zinc-400 whitespace-nowrap">{device.imei || '—'}</td>}
                                {visibleDeviceCols.includes('storage') && <td className="px-2 py-1 whitespace-nowrap">{device.storageGB ? `${device.storageGB} GB` : '—'}</td>}
                                {visibleDeviceCols.includes('ram') && <td className="px-2 py-1 whitespace-nowrap">{device.ramGB ? `${device.ramGB} GB` : '—'}</td>}
                                {visibleDeviceCols.includes('phone') && <td className="px-2 py-1 font-mono text-[9px] text-zinc-400 whitespace-nowrap">{device.phoneNumber || '—'}</td>}
                                {visibleDeviceCols.includes('battery') && (
                                  <td className="px-2 py-1 whitespace-nowrap">
                                    {device.batteryHealth != null ? (
                                      <span className={device.batteryHealth <= 20 ? 'text-red-400' : device.batteryHealth <= 50 ? 'text-amber-400' : 'text-zinc-300'}>
                                        {device.batteryHealth}%
                                      </span>
                                    ) : '—'}
                                  </td>
                                )}
                                {visibleDeviceCols.includes('devStatus') && (
                                  <td className="px-2 py-1 whitespace-nowrap">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                      device.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                      device.status === 'maintenance' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                      device.status === 'stock' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' :
                                      'bg-red-500/15 text-red-400 border border-red-500/20'
                                    }`}>
                                      {device.status === 'active' ? 'Ativo' :
                                       device.status === 'maintenance' ? 'Em manutenção' :
                                       device.status === 'stock' ? 'Em estoque' : 'Descomissionado'}
                                    </span>
                                  </td>
                                )}
                                {visibleDeviceCols.includes('lastSeen') && <td className="px-2 py-1 text-[9px] text-zinc-400 whitespace-nowrap">{formatDate(device.lastSeen)}</td>}
                                {visibleDeviceCols.includes('actions') && (
                                  <td className="px-2 py-1 text-right">
                                    <div className="flex gap-0.5 justify-end">
                                      <button onClick={() => openDeviceModal(device)} className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded"><Edit2 className="h-3 w-3" /></button>
                                      <button onClick={() => deleteDevice(device)} className="p-1 text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setShowCompanyModal(false)}>
          <div className="modal card w-full max-w-md p-6 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-1">{editingCompany ? 'Editar Empresa' : 'Nova Empresa'}</h3>
            <div className="space-y-4 mt-5">
              <div>
                <label className="text-sm font-medium text-zinc-400 block mb-1.5">Nome da empresa</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Empresa ABC Ltda" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-400 block mb-1.5">Contato (opcional)</label>
                <input value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} placeholder="Nome do responsável" className="w-full" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCompanyModal(false)} className="btn btn-secondary flex-1">Cancelar</button>
              <button onClick={saveCompany} className="btn btn-primary flex-1">{editingCompany ? 'Salvar' : 'Cadastrar'}</button>
            </div>
          </div>
        </div>
      )}

      {showComputerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setShowComputerModal(false)}>
          <div className="modal card w-full max-w-2xl max-h-[92vh] overflow-auto p-6 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold">{editingComputer ? 'Editar Computador' : 'Adicionar Computador'}</h3>
              <button onClick={() => setShowComputerModal(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'hostname', label: 'Hostname *' },
                { key: 'manufacturer', label: 'Fabricante' },
                { key: 'model', label: 'Modelo' },
                { key: 'serialNumber', label: 'Número de Série' },
                { key: 'assetTag', label: 'Tag do Ativo' },
                { key: 'cpu', label: 'Processador' },
                { key: 'cpuCores', label: 'Núcleos CPU', type: 'number' },
                { key: 'ramGB', label: 'RAM (GB)', type: 'number' },
                { key: 'diskGB', label: 'Disco (GB)', type: 'number' },
                { key: 'gpu', label: 'GPU' },
                { key: 'os', label: 'Sistema Operacional' },
                { key: 'osVersion', label: 'Versão do SO' },
                { key: 'osInstallDate', label: 'Data Instalação SO', type: 'date' },
                { key: 'lastBootTime', label: 'Última Inicialização', type: 'datetime-local' },
                { key: 'ipAddress', label: 'IP' },
                { key: 'macAddress', label: 'MAC Address' },
                { key: 'biosVersion', label: 'Versão BIOS' },
                { key: 'purchaseDate', label: 'Data de Compra', type: 'date' },
                { key: 'warrantyExpiry', label: 'Vencimento Garantia', type: 'date' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-zinc-400 mb-1">{field.label}</label>
                  <input 
                    type={field.type || 'text'} 
                    value={computerForm[field.key] || ''} 
                    onChange={(e) => setComputerForm({ ...computerForm, [field.key]: e.target.value })} 
                    className="w-full" 
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Status</label>
                <select
                  value={computerForm.status || 'active'}
                  onChange={(e) => setComputerForm({ ...computerForm, status: e.target.value })}
                  className="w-full"
                >
                  <option value="active">Ativo</option>
                  <option value="decommissioned">Descomissionado</option>
                  <option value="repair">Em manutenção</option>
                  <option value="storage">Em estoque</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Observações</label>
                <textarea value={computerForm.notes || ''} onChange={(e) => setComputerForm({ ...computerForm, notes: e.target.value })} className="w-full min-h-[70px]" />
              </div>
            </div>

            <div className="flex gap-3 mt-7 pt-4 border-t border-zinc-800">
              <button onClick={() => setShowComputerModal(false)} className="btn btn-secondary flex-1">Cancelar</button>
              <button onClick={saveComputer} className="btn btn-primary flex-1">{editingComputer ? 'Salvar' : 'Adicionar'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeviceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setShowDeviceModal(false)}>
          <div className="modal card w-full max-w-2xl max-h-[92vh] overflow-auto p-6 shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold">{editingDevice ? 'Editar Aparelho' : 'Adicionar Aparelho'}</h3>
              <button onClick={() => setShowDeviceModal(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'name', label: 'Nome *' },
                { key: 'manufacturer', label: 'Fabricante' },
                { key: 'model', label: 'Modelo' },
                { key: 'serialNumber', label: 'Número de Série' },
                { key: 'imei', label: 'IMEI' },
                { key: 'phoneNumber', label: 'Número de Telefone' },
                { key: 'os', label: 'Sistema Operacional' },
                { key: 'osVersion', label: 'Versão do SO' },
                { key: 'storageGB', label: 'Armazenamento (GB)', type: 'number' },
                { key: 'ramGB', label: 'RAM (GB)', type: 'number' },
                { key: 'batteryHealth', label: 'Saúde da Bateria (%)', type: 'number' },
                { key: 'ipAddress', label: 'IP' },
                { key: 'macAddress', label: 'MAC Address' },
                { key: 'assetTag', label: 'Tag do Ativo' },
                { key: 'purchaseDate', label: 'Data de Compra', type: 'date' },
                { key: 'warrantyExpiry', label: 'Vencimento Garantia', type: 'date' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-zinc-400 mb-1">{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    value={deviceForm[field.key] || ''}
                    onChange={(e) => setDeviceForm({ ...deviceForm, [field.key]: e.target.value })}
                    className="w-full"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Status</label>
                <select
                  value={deviceForm.status || 'active'}
                  onChange={(e) => setDeviceForm({ ...deviceForm, status: e.target.value })}
                  className="w-full"
                >
                  <option value="active">Ativo</option>
                  <option value="decommissioned">Descomissionado</option>
                  <option value="maintenance">Em manutenção</option>
                  <option value="stock">Em estoque</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Observações</label>
                <textarea value={deviceForm.notes || ''} onChange={(e) => setDeviceForm({ ...deviceForm, notes: e.target.value })} className="w-full min-h-[70px]" />
              </div>
            </div>

            <div className="flex gap-3 mt-7 pt-4 border-t border-zinc-800">
              <button onClick={() => setShowDeviceModal(false)} className="btn btn-secondary flex-1">Cancelar</button>
              <button onClick={saveDevice} className="btn btn-primary flex-1">{editingDevice ? 'Salvar' : 'Adicionar'}</button>
            </div>
           </div>
        </div>
      )}

      {showQRModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setShowQRModal(false)}>
          <div className="modal card w-full max-w-md p-6 shadow-2xl shadow-black/50 text-center" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Reportar Aparelho</h3>
              <button onClick={() => setShowQRModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Escaneie o QR Code com o celular para reportar automaticamente</p>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  (typeof window !== 'undefined' ? window.location.origin : '') + '/api/agent/device-report?key=' + selectedCompany.apiKey + '&company=' + encodeURIComponent(selectedCompany.name)
                )}`}
                alt="QR Code"
                width={250}
                height={250}
              />
            </div>
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 mb-4">
              <p className="text-[10px] text-zinc-500 mb-1">Link direto:</p>
              <p className="text-xs text-sky-400 font-mono break-all leading-relaxed">
                {(typeof window !== 'undefined' ? window.location.origin : '')}/api/agent/device-report?key={selectedCompany.apiKey}&company={encodeURIComponent(selectedCompany.name)}
              </p>
            </div>
            <button onClick={() => {
              const url = (typeof window !== 'undefined' ? window.location.origin : '') + '/api/agent/device-report?key=' + selectedCompany.apiKey + '&company=' + encodeURIComponent(selectedCompany.name);
              navigator.clipboard.writeText(url);
              toast.success('Link copiado!');
            }} className="btn btn-primary w-full">Copiar Link</button>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setShowHelpModal(false)}>
          <div className="modal card w-full max-w-3xl p-7 overflow-auto max-h-[92vh] shadow-2xl shadow-black/50" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold glow-text">Ajuda & Instruções</h3>
              <button onClick={() => setShowHelpModal(false)}><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-zinc-200">1. Instalar o Agente (PowerShell)</h4>
                <p className="text-zinc-400 mb-2">Copie e cole o comando abaixo no PC que deseja cadastrar:</p>
                <div className="bg-zinc-950/90 p-4 rounded-xl font-mono text-xs overflow-auto border border-sky-500/10 text-sky-300 relative group">
                  <pre className="pr-16">{`$apiKey = "${selectedCompany?.apiKey || 'SUA_API_KEY_AQUI'}"
$scriptUrl = "https://dbs-pc-portfolio.vercel.app/scripts/agent.ps1"

Invoke-Expression (Invoke-WebRequest -Uri $scriptUrl -UseBasicParsing).Content -ApiKey $apiKey`}</pre>
                  <button
                    onClick={() => copyToClipboard(
                      `$apiKey = "${selectedCompany?.apiKey || 'SUA_API_KEY_AQUI'}"\n$scriptUrl = "https://dbs-pc-portfolio.vercel.app/scripts/agent.ps1"\n\nInvoke-Expression (Invoke-WebRequest -Uri $scriptUrl -UseBasicParsing).Content -ApiKey $apiKey`,
                      "Comando"
                    )}
                    className="absolute top-2 right-2 p-1.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-zinc-200">2. Executar do arquivo local</h4>
                <p className="text-zinc-400 mb-2">Se já baixou o script para o PC:</p>
                <div className="bg-zinc-950/90 p-4 rounded-xl font-mono text-xs overflow-auto border border-sky-500/10 text-sky-300">
                  <pre>{`powershell -ExecutionPolicy Bypass -File "C:\\Script_dbs\\scripts\\agent.ps1" -ApiKey "${selectedCompany?.apiKey || 'SUA_API_KEY_AQUI'}"`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-zinc-200">3. Gerar instalador .exe (PS2EXE)</h4>
                <p className="text-zinc-400 mb-2">No servidor, para gerar um .exe do agente:</p>
                <div className="bg-zinc-950/90 p-4 rounded-xl font-mono text-xs overflow-auto border border-sky-500/10 text-sky-300">
                  <pre>{`# Instalar PS2EXE
Install-Module -Name ps2exe -Force -Scope CurrentUser

# Gerar .exe
Invoke-PS2EXE -InputFile "agent.ps1" -OutputFile "agent.exe" -Force

# Usar o .exe
.\\agent.exe -ApiKey "${selectedCompany?.apiKey || 'SUA_API_KEY_AQUI'}"`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-zinc-200">4. Executar na inicialização do Windows</h4>
                <p className="text-zinc-400 mb-2">Criar tarefa agendada para o agente rodar toda vez que o PC ligar:</p>
                <div className="bg-zinc-950/90 p-4 rounded-xl font-mono text-xs overflow-auto border border-sky-500/10 text-sky-300">
                  <pre>{`$taskName = "PCPortfolio_Agent"

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File \\"C:\\Script_dbs\\scripts\\agent.ps1\\" -ApiKey \\"${selectedCompany?.apiKey || 'SUA_API_KEY_AQUI'}\\""

$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "DBS PC Portfolio Agent" -RunLevel Highest`}</pre>
                </div>
                <p className="text-zinc-500 text-xs mt-2">Para remover: <span className="font-mono">Unregister-ScheduledTask -TaskName "PCPortfolio_Agent"</span></p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-zinc-200">5. .exe com API Key embutida (distribuição)</h4>
                <p className="text-zinc-400 mb-2">Crie uma versão do script com a API Key fixa antes de gerar o .exe:</p>
                <div className="bg-zinc-950/90 p-4 rounded-xl font-mono text-xs overflow-auto border border-sky-500/10 text-sky-300">
                  <pre>{`# Substituir a API Key no script
(Get-Content "agent.ps1") -replace '\\$ApiKey = .*', '$ApiKey = "${selectedCompany?.apiKey || 'SUA_API_KEY_AQUI'}"' | Set-Content "agent-fixed.ps1"

# Gerar .exe
Invoke-PS2EXE -InputFile "agent-fixed.ps1" -OutputFile "agent.exe" -Force`}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-zinc-200">6. Verificar tarefa agendada</h4>
                <div className="bg-zinc-950/90 p-4 rounded-xl font-mono text-xs overflow-auto border border-sky-500/10 text-sky-300">
                  <pre>{`# Listar a tarefa
Get-ScheduledTask -TaskName "PCPortfolio_Agent"

# Ver status
Get-ScheduledTaskInfo -TaskName "PCPortfolio_Agent"

# Executar manualmente
Start-ScheduledTask -TaskName "PCPortfolio_Agent"`}</pre>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 text-right">
              <button onClick={() => setShowHelpModal(false)} className="btn btn-secondary">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {historyComputer && (
        <HistoryModal
          computerId={historyComputer.id}
          hostname={historyComputer.hostname}
          onClose={() => setHistoryComputer(null)}
        />
      )}
    </div>
  );
}
