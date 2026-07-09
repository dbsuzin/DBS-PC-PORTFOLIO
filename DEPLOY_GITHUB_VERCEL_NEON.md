================================================================================
           PC PORTFOLIO - DEPLOY COMPLETO
           GitHub → Vercel → Neon Postgres
           (SEM DESENVOLVIMENTO LOCAL)
================================================================================

PASSO A PASSO EXATO PARA PRODUÇÃO

--------------------------------------------------------------------------------
PASSO 1: CRIAR BANCO NO NEON (GRATUITO)
--------------------------------------------------------------------------------

1. Acesse: https://neon.tech
2. Crie uma conta gratuita
3. Clique em "Create a Project"
4. Escolha qualquer nome (ex: pc-portfolio)
5. Clique em "Create Project"
6. No dashboard do projeto, clique em "Connection Details"
7. Copie a **Connection string** completa (exemplo):
   postgresql://neondb_owner:senha@ep-abc123.us-east-1.aws.neon.tech/neondb?sslmode=require

⚠️ GUARDE ESSA STRING - você vai precisar dela no Vercel

--------------------------------------------------------------------------------
PASSO 2: PREPARAR O CÓDIGO PARA GITHUB
--------------------------------------------------------------------------------

1. Crie uma nova pasta vazia no seu computador:
   mkdir pc-portfolio
   cd pc-portfolio

2. Extraia o arquivo `pc-portfolio-vercel-neon.zip` dentro dessa pasta.

3. Inicialize o Git:

```bash
git init
git add .
git commit -m "PC Portfolio - versão inicial"
git branch -M main
```

4. Crie um repositório novo no GitHub:
   - Vá em https://github.com/new
   - Nome: `pc-portfolio` (ou o que preferir)
   - Público ou Privado
   - NÃO inicialize com README

5. Conecte e envie:

```bash
git remote add origin https://github.com/SEU_USUARIO/pc-portfolio.git
git push -u origin main
```

--------------------------------------------------------------------------------
PASSO 3: DEPLOY NO VERCEL
--------------------------------------------------------------------------------

1. Acesse https://vercel.com e faça login com sua conta GitHub
2. Clique em **Add New Project**
3. Selecione o repositório `pc-portfolio`
4. Na tela de configuração:
   - Framework Preset: Next.js (já detecta automaticamente)
   - Root Directory: . (deixe em branco)
5. **IMPORTANTE**: Clique em **Environment Variables** e adicione **EXATAMENTE** estas duas variáveis:

   | Name            | Value (cole da sua conta Neon)                          |
   |-----------------|---------------------------------------------------------|
   | `DATABASE_URL`  | `postgresql://neondb_owner:...@...neon.tech/...`        |
   | `APP_PASSWORD`  | `admin123`   (ou uma senha forte que você escolher)     |

6. Clique em **Deploy**

Aguarde o deploy terminar (pode demorar 1-2 minutos).

--------------------------------------------------------------------------------
PASSO 4: CONFIGURAR O BANCO (MIGRATIONS)
--------------------------------------------------------------------------------

Depois que o primeiro deploy terminar:

**Opção A - Mais simples (via Vercel):**

1. No Vercel, vá em **Deployments**
2. Clique nos **3 pontinhos** do último deploy
3. Clique em **Redeploy**

**Opção B - Via terminal (recomendada):**

```bash
npm i -g vercel
vercel login
vercel env pull .env.local
npx prisma migrate deploy
```

--------------------------------------------------------------------------------
PASSO 5: ACESSAR O SISTEMA
--------------------------------------------------------------------------------

1. No Vercel, copie a URL do seu projeto (ex: https://pc-portfolio-abc123.vercel.app)
2. Acesse a URL
3. Use a senha que você definiu em `APP_PASSWORD` (padrão: admin123)

Pronto! O sistema está rodando 100% em produção.

--------------------------------------------------------------------------------
PASSO 6: (OPCIONAL) CONFIGURAR AGENTES
--------------------------------------------------------------------------------

Depois que o app estiver no ar:

- Crie uma empresa no sistema
- Copie a **API Key** da empresa
- Use os scripts em `/scripts/agent.py` ou `/scripts/agent.ps1`
- Substitua a URL pelo seu domínio do Vercel

Exemplo de uso do agente:
```bash
python scripts/agent.py --api-key SUA_CHAVE --url https://seu-projeto.vercel.app/api/agent/report
```

--------------------------------------------------------------------------------
RESUMO DAS VARIÁVEIS DE AMBIENTE NO VERCEL
--------------------------------------------------------------------------------

| Variável        | Obrigatória | Exemplo |
|-----------------|-------------|---------|
| DATABASE_URL    | Sim         | postgresql://...neon.tech... |
| APP_PASSWORD    | Sim         | admin123 |

NUNCA coloque DATABASE_URL com SQLite em produção.

--------------------------------------------------------------------------------
PROBLEMAS COMUNS E SOLUÇÕES
--------------------------------------------------------------------------------

❌ "PrismaClientKnownRequestError: The table does not exist"
→ Rode `npx prisma migrate deploy` ou Redeploy no Vercel após configurar as env vars.

❌ Erro de build no Vercel
→ Verifique se as duas variáveis de ambiente estão corretas.
→ Certifique-se que o buildCommand no vercel.json está correto.

❌ Não consegue fazer login
→ Verifique se APP_PASSWORD está definido corretamente no Vercel.

❌ "Cannot find module 'prisma/config'"
→ Já foi corrigido (schema.prisma usa PostgreSQL).

--------------------------------------------------------------------------------
PRÓXIMOS PASSOS APÓS DEPLOY
--------------------------------------------------------------------------------

- Mude a senha `APP_PASSWORD` para algo forte
- Crie empresas e copie as API Keys
- Instale o agente Python nos PCs dos clientes
- Agende o agente para rodar todo dia

O sistema está pronto para produção!

================================================================================
