import { X, Copy, Check, Terminal, Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from './Toast';

interface AgentModalProps {
  apiKey: string;
  companyName: string;
  appUrl: string;
  onClose: () => void;
}

export default function AgentModal({ apiKey, companyName, appUrl, onClose }: AgentModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'python' | 'powershell'>('python');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const agentUrl = `${appUrl}/api/agent/report`;

  const pythonCmd = `python agent.py --api-key ${apiKey} --url ${agentUrl}`;
  const psCmd = `powershell -ExecutionPolicy Bypass -File ".\\agent.ps1" -ApiKey "${apiKey}" -Url "${agentUrl}"`;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="card w-full max-w-2xl p-0 modal max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Terminal className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Instalar Agente</h2>
              <p className="text-xs text-zinc-500">{companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* API Key */}
          <div>
            <label className="text-xs text-zinc-400 mb-2 block font-medium">🔑 API Key desta empresa</label>
            <div className="flex items-center gap-2">
              <code className="api-key flex-1 select-all">{apiKey}</code>
              <button
                onClick={() => copyToClipboard(apiKey, 'apikey')}
                className="btn btn-secondary py-2 px-3"
              >
                {copiedField === 'apikey' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex border-b border-zinc-800 mb-4">
              <button
                onClick={() => setActiveTab('python')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'python'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                🐍 Python (recomendado)
              </button>
              <button
                onClick={() => setActiveTab('powershell')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'powershell'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ⚡ PowerShell (Windows)
              </button>
            </div>

            {activeTab === 'python' ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-300 mb-2 font-medium">Passo 1 — Baixe o arquivo <code className="text-blue-400">agent.py</code></p>
                  <p className="text-xs text-zinc-500 mb-2">
                    Salve o arquivo <code>scripts/agent.py</code> do repositório no PC do cliente.
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
                    <div className="code-block">pip install requests psutil{'\n'}# No Windows, instale também:{'\n'}pip install wmi</div>
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
                    <div className="code-block">{pythonCmd}</div>
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
                    Use o <strong>Agendador de Tarefas</strong> (Windows) ou <strong>cron</strong> (Linux/Mac) para executar o agente diariamente. 
                    Assim os dados ficam sempre atualizados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-zinc-300 mb-2 font-medium">Passo 1 — Baixe o arquivo <code className="text-blue-400">agent.ps1</code></p>
                  <p className="text-xs text-zinc-500 mb-2">
                    Salve o arquivo <code>scripts/agent.ps1</code> do repositório no PC do cliente.
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
                    <div className="code-block">{psCmd}</div>
                    <button
                      onClick={() => copyToClipboard(psCmd, 'pscmd')}
                      className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                    >
                      {copiedField === 'pscmd' ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-300 font-medium mb-1">⚠️ Erro "não está assinado digitalmente"?</p>
                  <p className="text-xs text-zinc-400">
                    O parâmetro <code className="text-blue-400">-ExecutionPolicy Bypass</code> já está incluído no comando acima 
                    e resolve esse problema. Execute o PowerShell como <strong>Administrador</strong>.
                  </p>
                </div>

                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-xs text-yellow-300 font-medium mb-1">💡 Agendar execução automática</p>
                  <p className="text-xs text-zinc-400">
                    Abra o <strong>Agendador de Tarefas</strong> → Criar Tarefa Básica → Ação: "Iniciar um programa" → 
                    Programa: <code>powershell</code> → Argumentos: <code>-ExecutionPolicy Bypass -File "C:\caminho\agent.ps1" -ApiKey "{apiKey}"</code>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Após rodar o agente */}
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
            <p className="text-sm text-green-300 font-medium mb-1">✅ Depois de rodar o agente</p>
            <p className="text-xs text-zinc-400">
              Clique no botão <strong className="text-green-400">🔄 Atualizar</strong> na lista de computadores 
              para ver o PC recém-cadastrado. Os dados aparecem instantaneamente após a atualização.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
