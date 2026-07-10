"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Building2, Monitor, Copy, Trash2, Edit2, RefreshCw, 
  Download, X, FileSpreadsheet, Terminal, Check
} from 'lucide-react';
import { toast } from 'sonner';
import LoginModal from './components/LoginModal';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showComputerModal, setShowComputerModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [computerForm, setComputerForm] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [agentTab, setAgentTab] = useState<'python' | 'powershell'>('python');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

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

  // ========== FUNÇÃO ATUALIZAR ==========
  const refreshComputers = async () => {
    if (!selectedCompany) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/computers?companyId=${selectedCompany.id}`);
      const data = await res.json();
      setComputers(data);
      
      // Atualizar contagem na empresa
      await fetchCompanies();
      
      toast.success(`✅ Lista atualizada! ${data.length} computador(es) encontrado(s).`);
    } catch (error) {
      toast.error('Erro ao atualizar lista');
    } finally {
      setIsRefreshing(false);
    }
  };

  const selectCompany = (company: Company) => {
    setSelectedCompany(company);
    setSearchTerm('');
    fetchComputers(company.id);
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
      toast.success(editingComputer ? 'Computador atualizado!' : 'Computador adicionado!');
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openAgentModal = () => setShowAgentModal(true);

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

  const filteredComputers = computers.filter(c =>
    c.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.manufacturer && c.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.os && c.os.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.ipAddress && c.ipAddress.includes(searchTerm))
  );

  // URLs para o modal do agente
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dbs-pc-portfolio.vercel.app';
  const agentUrl = `${appUrl}/api/agent/report`;
  const pythonCmd = `python agent.py --api-key ${selectedCompany?.apiKey || 'SUA_API_KEY'} --url ${agentUrl}`;
  const psCmd = `powershell -ExecutionPolicy Bypass -File ".\\agent.ps1" -ApiKey "${selectedCompany?.apiKey || 'SUA_API_KEY'}" -Url "${agentUrl}"`;

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-50">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/dbs-logo.png" alt="DBS" className="h-16 w-auto object-contain" />
            <div>
              <h1 className="font-semibold text-2xl tracking-tight">PC Portfolio</h1>
              <p className="text-xs text-zinc-500 -mt-1">Inventário de Computadores</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={openAgentModal}
              className="btn btn-secondary flex items-center gap-2 text-sm"
            >
              <Terminal className="h-4 w-4" />
              Agente / Script
            </button>
            
            <button 
              onClick={() => openCompanyModal()}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Empresa
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 w-full">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-zinc-800 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h2 className="font-medium text-xs uppercase tracking-widest text-zinc-500">Empresas</h2>
              <p className="text-xs text-zinc-400 mt-1">{companies.length} cadastradas</p>
            </div>
            <button onClick={fetchCompanies} className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-900">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><RefreshCw className="animate-spin h-4 w-4 text-zinc-400" /></div>
          ) : companies.length === 0 ? (
            <div className="text-center py-6 px-2 text-xs text-zinc-500">Nenhuma empresa cadastrada.</div>
          ) : (
            <div className="space-y-1 overflow-auto flex-1 pr-1">
              {companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => selectCompany(company)}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all border ${
                    selectedCompany?.id === company.id 
                      ? 'bg-zinc-900 border-zinc-700' 
                      : 'hover:bg-zinc-900/60 border-transparent hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-sm">{company.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{company._count?.computers || 0} PC(s)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); openCompanyModal(company); }} className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCompany(company); }} className="p-1 hover:bg-zinc-800 rounded text-red-400 hover:text-red-300">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-zinc-800 px-1">
            {selectedCompany && (
              <div>
                <div className="text-xs text-zinc-500 mb-2">API Key da empresa</div>
                <div className="font-mono text-xs bg-zinc-900 px-2 py-1.5 rounded mb-2 truncate border border-zinc-800">
                  {selectedCompany.apiKey}
                </div>
                <button 
                  onClick={() => copyToClipboard(selectedCompany.apiKey, "apikey")} 
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs"
                >
                  {copiedField === 'apikey' ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  {copiedField === 'apikey' ? 'Copiado!' : 'Copiar API Key'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedCompany ? (
            <div className="flex flex-1 items-center justify-center p-12 text-center">
              <div>
                <div className="mx-auto mb-6 h-16 w-16 flex items-center justify-center rounded-2xl bg-zinc-900">
                  <Monitor className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="font-semibold text-2xl mb-2">Selecione uma empresa</h3>
                <p className="text-zinc-400 max-w-xs mx-auto text-sm">Escolha uma empresa na barra lateral.</p>
                <button onClick={() => openCompanyModal()} className="mt-6 btn btn-primary mx-auto">Cadastrar primeira empresa</button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-semibold tracking-tight">{selectedCompany.name}</h2>
                    <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400">{computers.length} computadores</span>
                  </div>
                  {selectedCompany.contact && <p className="text-sm text-zinc-400 mt-0.5">{selectedCompany.contact}</p>}
                </div>

                <div className="flex items-center gap-3">
                  {/* ========== BOTÃO ATUALIZAR ========== */}
                  <button 
                    onClick={refreshComputers} 
                    disabled={isRefreshing}
                    className="btn btn-success flex items-center gap-2 text-sm disabled:opacity-60"
                    title="Atualizar lista de computadores"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                  </button>

                  <button onClick={exportToExcel} className="btn btn-secondary flex items-center gap-2 text-sm">
                    <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
                  </button>
                  <button onClick={() => openComputerModal()} className="btn btn-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Adicionar PC
                  </button>
                </div>
              </div>

              {/* API Key */}
              <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="font-mono bg-zinc-950 px-3 py-1.5 rounded text-xs border border-zinc-800">{selectedCompany.apiKey}</div>
                  <button 
                    onClick={() => copyToClipboard(selectedCompany.apiKey, "apikey-bar")} 
                    className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300"
                  >
                    {copiedField === 'apikey-bar' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedField === 'apikey-bar' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <div className="text-xs text-zinc-500">Use esta chave no agente</div>
              </div>

              {/* Search */}
              <div className="px-6 pt-5 pb-3 flex items-center gap-4">
                <input 
                  placeholder="Buscar por hostname, fabricante, SO ou IP..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="flex-1 max-w-md" 
                />
                <div className="text-xs text-zinc-500">{filteredComputers.length} / {computers.length}</div>
              </div>

              {/* Table */}
              <div className="px-6 pb-8 flex-1">
                {computers.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-zinc-800 rounded-2xl">
                    <Monitor className="mx-auto mb-4 h-10 w-10 text-zinc-600" />
                    <p className="text-lg text-zinc-400">Nenhum computador cadastrado.</p>
                    <p className="text-sm text-zinc-500 mt-2 mb-4">Use o Agente para cadastrar automaticamente ou adicione manualmente.</p>
                    <div className="flex gap-3 justify-center">
                      <button onClick={openAgentModal} className="btn btn-secondary">
                        <Terminal className="h-4 w-4" /> Instalar Agente
                      </button>
                      <button onClick={() => openComputerModal()} className="btn btn-primary">
                        <Plus className="h-4 w-4" /> Adicionar PC
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card overflow-x-auto">
                    <table className="w-full text-xs min-w-[1400px]">
                      <thead>
                        <tr className="text-left">
                          <th className="px-3 py-2.5 font-medium text-zinc-400">Hostname</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">Fabricante/Modelo</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">CPU</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">RAM</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">Disco</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">SO / Versão</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">Inst. SO</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">Últ. Boot</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">IP</th>
                          <th className="px-3 py-2.5 font-medium text-zinc-400">Atualizado</th>
                          <th className="px-3 py-2.5 font-medium text-right text-zinc-400 sticky right-0 bg-zinc-900" style={{ minWidth: '100px' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredComputers.map((comp) => (
                          <tr key={comp.id} className="computer-row hover:bg-zinc-900/70 border-t border-zinc-800 group">
                            <td className="px-3 py-2 font-medium whitespace-nowrap">{comp.hostname}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-zinc-300">
                              {comp.manufacturer ? `${comp.manufacturer} / ${comp.model || ''}` : '—'}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-zinc-300">
                              {comp.cpu ? (comp.cpuCores ? `${comp.cpu} (${comp.cpuCores})` : comp.cpu) : '—'}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatGB(comp.ramGB)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {comp.disks ? comp.disks : formatGB(comp.diskGB)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-zinc-300">
                              {comp.os ? `${comp.os} ${comp.osVersion || ''}`.trim() : '—'}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatDateOnly(comp.osInstallDate)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(comp.lastBootTime)}</td>
                            <td className="px-3 py-2 font-mono text-zinc-400 whitespace-nowrap">{comp.ipAddress || '—'}</td>
                            <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{formatDate(comp.lastSeen)}</td>
                            <td className="px-3 py-2 text-right sticky right-0 bg-zinc-950 group-hover:bg-zinc-900" style={{ minWidth: '100px' }}>
                              <div className="flex gap-1 justify-end">
                                <button 
                                  onClick={() => openComputerModal(comp)} 
                                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => deleteComputer(comp)} 
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-zinc-700 rounded transition"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ========== MODALS ========== */}

      {/* Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setShowCompanyModal(false)}>
          <div className="modal card w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
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

      {/* Computer Modal */}
      {showComputerModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setShowComputerModal(false)}>
          <div className="modal card w-full max-w-2xl max-h-[92vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
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

      {/* ========== AGENT MODAL (NOVO - CORRIGIDO) =========== */}
      {showAgentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4" onClick={() => setShowAgentModal(false)}>
          <div className="modal card w-full max-w-2xl p-0 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Terminal className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Instalar Agente</h2>
                  <p className="text-xs text-zinc-500">{selectedCompany?.name || 'Selecione uma empresa'}</p>
                </div>
              </div>
              <button onClick={() => setShowAgentModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* API Key */}
              {selectedCompany ? (
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block font-medium">🔑 API Key desta empresa</label>
                  <div className="flex items-center gap-2">
                    <code className="api-key flex-1 select-all bg-zinc-900 px-3 py-2 rounded-lg font-mono text-sm border border-zinc-800">{selectedCompany.apiKey}</code>
                    <button
                      onClick={() => copyToClipboard(selectedCompany.apiKey, 'modal-apikey')}
                      className="btn btn-secondary py-2 px-3"
                    >
                      {copiedField === 'modal-apikey' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-950/40 border border-yellow-800/60 text-yellow-200 p-3 rounded-xl text-sm">
                  ⚠️ Selecione uma empresa na barra lateral para ver a API Key.
                </div>
              )}

              {/* Tabs */}
              <div>
                <div className="flex border-b border-zinc-800 mb-4">
                  <button
                    onClick={() => setAgentTab('python')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      agentTab === 'python'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    🐍 Python (recomendado)
                  </button>
                  <button
                    onClick={() => setAgentTab('powershell')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      agentTab === 'powershell'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    ⚡ PowerShell (Windows)
                  </button>
                </div>

                {agentTab === 'python' ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-zinc-300 mb-2 font-medium">Passo 1 — Baixe o arquivo <code className="text-blue-400">agent.py</code></p>
                      <p className="text-xs text-zinc-500 mb-2">
                        Salve o arquivo no PC do cliente.
                      </p>
                      <a
                        href="https://raw.githubusercontent.com/dbsuzin/DBS-PC-PORTFOLIO/main/scripts/agent.py"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar agent.py
                      </a>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-300 mb-2 font-medium">Passo 2 — Instale as dependências</p>
                      <div className="relative">
                        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300 overflow-x-auto">pip install requests psutil{'\n'}# No Windows, instale também:{'\n'}pip install wmi</pre>
                        <button
                          onClick={() => copyToClipboard('pip install requests psutil wmi', 'pip')}
                          className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                        >
                          {copiedField === 'pip' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-300 mb-2 font-medium">Passo 3 — Execute o agente</p>
                      <div className="relative">
                        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">{pythonCmd}</pre>
                        <button
                          onClick={() => copyToClipboard(pythonCmd, 'pycmd')}
                          className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                        >
                          {copiedField === 'pycmd' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-300 font-medium mb-1">💡 Dica: Agende para rodar automaticamente</p>
                      <p className="text-xs text-zinc-400">
                        Use o <strong>Agendador de Tarefas</strong> (Windows) ou <strong>cron</strong> (Linux/Mac)
                        para executar o agente diariamente.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-zinc-300 mb-2 font-medium">Passo 1 — Baixe o arquivo <code className="text-blue-400">agent.ps1</code></p>
                      <p className="text-xs text-zinc-500 mb-2">
                        Salve o arquivo no PC do cliente.
                      </p>
                      <a
                        href="https://raw.githubusercontent.com/dbsuzin/DBS-PC-PORTFOLIO/main/scripts/agent.ps1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary text-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar agent.ps1
                      </a>
                    </div>

                    <div>
                      <p className="text-sm text-zinc-300 mb-2 font-medium">Passo 2 — Execute no PowerShell (como Admin)</p>
                      <div className="relative">
                        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">{psCmd}</pre>
                        <button
                          onClick={() => copyToClipboard(psCmd, 'pscmd')}
                          className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                        >
                          {copiedField === 'pscmd' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-xs text-blue-300 font-medium mb-1">⚠️ Erro &quot;não está assinado digitalmente&quot;?</p>
                      <p className="text-xs text-zinc-400">
                        O parâmetro <code className="text-blue-400">-ExecutionPolicy Bypass</code> já está incluído no comando acima
                        e resolve esse problema. Execute o PowerShell como <strong>Administrador</strong>.
                      </p>
                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-300 font-medium mb-1">💡 Agendar execução automática</p>
                      <p className="text-xs text-zinc-400">
                        Abra o <strong>Agendador de Tarefas</strong> → Criar Tarefa Básica → Ação: &quot;Iniciar um programa&quot; →
                        Programa: <code>powershell</code> → Argumentos com o comando acima.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instrução pós-execução */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                <p className="text-sm text-green-300 font-medium mb-1">✅ Depois de rodar o agente</p>
                <p className="text-xs text-zinc-400">
                  Clique no botão <strong className="text-green-400">🔄 Atualizar</strong> na lista de computadores
                  para ver o PC recém-cadastrado. Os dados aparecem instantaneamente!
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-800">
              <button onClick={() => setShowAgentModal(false)} className="btn btn-secondary w-full justify-center">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
