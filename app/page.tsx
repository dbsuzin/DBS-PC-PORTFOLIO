"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Building2, Monitor, Copy, Trash2, Edit2, RefreshCw, 
  Download, X, FileSpreadsheet 
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
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showComputerModal, setShowComputerModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [computerForm, setComputerForm] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
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
              <Download className="h-4 w-4" />
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
                  onClick={() => copyToClipboard(selectedCompany.apiKey, "API Key")} 
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs"
                >
                  <Copy className="h-3 w-3" /> Copiar API Key
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
              <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="font-mono bg-zinc-950 px-3 py-1.5 rounded text-xs border border-zinc-800">{selectedCompany.apiKey}</div>
                  <button onClick={() => copyToClipboard(selectedCompany.apiKey, "API Key")} className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300">
                    <Copy className="h-3.5 w-3.5" /> Copiar
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
                    <button onClick={() => openComputerModal()} className="mt-4 btn btn-primary">Adicionar PC</button>
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

      {/* Modals */}
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

      {showAgentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-6" onClick={() => setShowAgentModal(false)}>
          <div className="modal card w-full max-w-3xl p-7 overflow-auto max-h-[92vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-1">
              <div>
                <h3 className="text-2xl font-semibold mb-1">Agente para Computadores</h3>
                <p className="text-zinc-400 mb-5">Instale o script em cada PC. Ele reporta automaticamente as configurações.</p>
              </div>
              <button onClick={() => setShowAgentModal(false)}><X className="h-5 w-5" /></button>
            </div>

            {selectedCompany ? (
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl mb-5">
                <div className="text-xs text-zinc-400 mb-2">API Key da empresa <span className="text-zinc-200 font-semibold">{selectedCompany.name}</span></div>
                <div className="flex items-center gap-2">
                  <div className="api-key flex-1 text-sm font-mono">{selectedCompany.apiKey}</div>
                  <button onClick={() => copyToClipboard(selectedCompany.apiKey, "API Key")} className="btn btn-secondary text-xs px-3 py-1.5">Copiar</button>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-950/40 border border-yellow-800/60 text-yellow-200 p-3 rounded-xl mb-5 text-sm">
                ⚠️ Selecione uma empresa na barra lateral para ver a API Key correspondente.
              </div>
            )}

            <div className="space-y-6 text-sm">
              {/* Passo 1 */}
              <div>
                <div className="font-semibold mb-2 text-zinc-200 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">1</span>
                  Baixe o script agent.ps1
                </div>
                <p className="text-xs text-zinc-400 mb-2 ml-8">Salve o arquivo em uma pasta acessível no computador (ex: <code className="bg-zinc-900 px-1.5 py-0.5 rounded">C:\PCPortfolio\</code>).</p>
                <div className="ml-8">
                  <a 
                    href="/scripts/agent.ps1" 
                    download
                    className="btn btn-secondary text-xs inline-flex items-center gap-2"
                  >
                    <Download className="h-3.5 w-3.5" /> Baixar agent.ps1
                  </a>
                </div>
              </div>

              {/* Passo 2 */}
              <div>
                <div className="font-semibold mb-2 text-zinc-200 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">2</span>
                  Execute no PowerShell (como Administrador)
                </div>
                <p className="text-xs text-zinc-400 mb-2 ml-8">Abra o PowerShell na pasta onde salvou o script e execute:</p>
                <div className="ml-8">
                  <div className="bg-black p-4 rounded-xl font-mono text-xs overflow-auto border border-zinc-800 relative group">
                    <button
                      onClick={() => copyToClipboard(
                        `powershell -ExecutionPolicy Bypass -File ".\\agent.ps1" -ApiKey "${selectedCompany?.apiKey || 'SUA_API_KEY'}"`,
                        "Comando"
                      )}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs px-2 py-1 rounded"
                    >
                      <Copy className="h-3 w-3 inline mr-1" /> Copiar
                    </button>
                    <pre className="whitespace-pre-wrap break-all pr-16">{`powershell -ExecutionPolicy Bypass -File ".\\agent.ps1" -ApiKey "${selectedCompany?.apiKey || 'SUA_API_KEY'}"`}</pre>
                  </div>
                </div>
              </div>

              {/* Passo 3 (opcional) */}
              <div>
                <div className="font-semibold mb-2 text-zinc-200 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold">3</span>
                  Agende para execução automática (opcional)
                </div>
                <p className="text-xs text-zinc-400 ml-8">
                  Use o <strong>Task Scheduler</strong> do Windows para agendar o script para rodar diariamente e manter o inventário sempre atualizado.
                </p>
              </div>

              <div className="text-xs bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-zinc-300">
                <strong className="text-zinc-100">💡 Dica:</strong> Cada empresa possui uma API Key única. Certifique-se de usar a chave correta para cada computador.
              </div>
            </div>

            <div className="mt-6 text-right">
              <button onClick={() => setShowAgentModal(false)} className="btn btn-secondary">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}