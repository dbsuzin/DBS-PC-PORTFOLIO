# PC Portfolio

Sistema completo para você (T.I.) gerenciar o portfólio de computadores de todos os seus clientes em um só lugar.

## ✅ O que tem

- Cadastro de **empresas** (clientes)
- Tabela completa com **todos os PCs** de cada empresa
- **Novos campos**: Data de instalação do SO + Última inicialização
- Exportar para **Excel** com 1 clique
- **Login simples** (senha configurável)
- **Agente automático** (Python + PowerShell) que coleta:
  - Todas as especificações
  - Data de instalação do Windows
  - Última vez que o PC ligou

---

## 🚀 Deploy Rápido (Vercel + Neon)

### Passo 1: Criar banco no Neon (gratuito)

1. Acesse: [https://neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a **Connection String** (clique em "Connection Details" → "Connection string")

### Passo 2: Subir no GitHub

```bash
git init
git add .
git commit -m "PC Portfolio - versão inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/pc-portfolio.git
git push -u origin main
```

### Passo 3: Deploy no Vercel

1. Entre em [https://vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New Project"**
3. Importe o repositório `pc-portfolio`
4. Na tela de configuração, clique em **"Environment Variables"** e adicione **duas** variáveis:

   | Name            | Value                                      |
   |----------------|--------------------------------------------|
   | `DATABASE_URL` | `postgresql://...` (cole a string do Neon) |
   | `APP_PASSWORD` | `sua-senha-forte-aqui`                     |

5. Clique em **Deploy**

### Passo 4: Rodar as migrations no banco (importante!)

Depois que o deploy terminar:

1. Vá no seu projeto no Vercel
2. Clique na aba **"Deployments"**
3. Clique nos **3 pontinhos** do último deploy → **"Redeploy"** (ou use o terminal)

**Ou faça via terminal (recomendado):**

```bash
# Instale o Vercel CLI
npm i -g vercel

# Faça login
vercel login

# Rode as migrations
vercel env pull .env.local
npx prisma migrate deploy
```

Ou mais simples: no Vercel, vá em **Settings → General → Build & Development Settings** e mude o **Build Command** para:

```
prisma generate && prisma migrate deploy && next build
```

Depois clique em **Redeploy**.

---

## Como usar

### 1. Acesse o app

- URL do Vercel (ex: `https://pc-portfolio-xxx.vercel.app`)
- Senha padrão: a que você colocou em `APP_PASSWORD`

### 2. Crie uma empresa

- Clique em **"Nova Empresa"**
- Copie a **API Key** que aparece

### 3. Instale o agente nos computadores

**Opção recomendada - Python (funciona em Windows, Linux e macOS):**

Baixe o arquivo `scripts/agent.py`

Instale as dependências:

```bash
pip install requests psutil
# No Windows também:
pip install wmi
```

Execute:

```bash
python scripts/agent.py --api-key SUA_API_KEY --url https://dbs-pc-portfolio.vercel.app/api/agent/report
```

**PowerShell (Windows):**

```powershell
.\scripts\agent.ps1 -ApiKey "SUA_API_KEY"
```

**Dica importante:** Agende para rodar todo dia (Task Scheduler ou cron).

---

## Estrutura dos arquivos

```
├── app/
│   ├── api/           ← APIs (empresas, pcs, agente, exportar excel)
│   ├── components/
│   ├── page.tsx       ← Interface principal
│   └── layout.tsx
├── lib/prisma.ts
├── prisma/
│   └── schema.prisma  ← Modelo do banco
├── scripts/
│   ├── agent.py       ← Agente Python (melhor)
│   └── agent.ps1      ← Agente PowerShell (Windows)
├── vercel.json
├── .env.example
└── README.md
```

---

## Variáveis de Ambiente (Vercel)

| Variável       | Obrigatória | Exemplo |
|----------------|-------------|--------|
| `DATABASE_URL` | Sim         | `postgresql://...neon.tech...` |
| `APP_PASSWORD` | Sim         | `minha-senha-123` |

---

## Dicas de Produção

- Mude a senha (`APP_PASSWORD`) imediatamente
- Use sempre **Neon Postgres** (não SQLite em produção)
- Agende o agente para rodar automaticamente nos PCs dos clientes
- Faça backup da API Key de cada empresa

Pronto! Sistema 100% funcional para gerenciar todos os seus clientes.

Qualquer dúvida, é só chamar.
