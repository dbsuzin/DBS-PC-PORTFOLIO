# 🚀 Guia de Deploy - PC Portfolio (100% Funcional)

## Passo a Passo Completo (Vercel + Neon + GitHub)

### 1. Criar o Banco de Dados (Neon)

1. Acesse: https://neon.tech
2. Crie uma conta gratuita
3. Clique em **"Create a Project"**
4. Escolha região mais próxima (ex: South America)
5. Depois de criar, clique em **"Connection Details"**
6. Copie a **Connection String** completa (tem `?sslmode=require`)

Exemplo do que você vai copiar:
```
postgresql://neon_user:abc123xyz@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Preparar o Projeto Localmente

```bash
# 1. Clone ou baixe este projeto

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env` e cole a Connection String do Neon:

```env
DATABASE_URL="postgresql://neon_user:abc123xyz@ep-...neon.tech/neondb?sslmode=require"
APP_PASSWORD="sua-senha-forte-aqui-2025"
```

### 3. Testar Localmente (opcional, mas recomendado)

```bash
npm run dev
```

Acesse http://localhost:3000  
Senha = valor de `APP_PASSWORD`

### 4. Subir para o GitHub

```bash
git init
git add .
git commit -m "PC Portfolio - versão inicial"
git branch -M main

# Troque pela sua URL do GitHub
git remote add origin https://github.com/SEU_USUARIO/pc-portfolio.git
git push -u origin main
```

### 5. Deploy no Vercel

1. Acesse https://vercel.com e faça login com GitHub
2. Clique em **"Add New → Project"**
3. Selecione o repositório `pc-portfolio`
4. **Antes de clicar em Deploy**, clique em **"Environment Variables"**

Adicione **exatamente** estas duas variáveis:

| Nome             | Valor                                      |
|------------------|--------------------------------------------|
| `DATABASE_URL`   | Cole a string completa do Neon             |
| `APP_PASSWORD`   | Sua senha forte (ex: `admin123`)           |

5. Clique em **Deploy**

### 6. Rodar as Migrations no Banco (MUITO IMPORTANTE)

Depois que o deploy terminar, faça o seguinte:

#### Opção A (Mais Fácil) - Pelo Vercel

1. No Vercel, vá no seu projeto
2. Clique na aba **Settings**
3. Vá em **General**
4. Em **Build & Development Settings**, mude o campo **Build Command** para:

```
prisma generate && prisma migrate deploy && next build
```

5. Role até o final e clique em **Save**
6. Volte na aba **Deployments** e clique em **Redeploy** no último deploy

#### Opção B - Via Terminal (recomendada)

```bash
# Instale o Vercel CLI
npm install -g vercel

# Login
vercel login

# Rode as migrations
npx prisma migrate deploy
```

### 7. Pronto!

Acesse a URL gerada pelo Vercel.

- Login com a senha que você definiu em `APP_PASSWORD`
- Crie sua primeira empresa
- Copie a API Key
- Use o script do agente (`scripts/agent.py` ou `scripts/agent.ps1`)

---

## Dicas Finais

- **Nunca** suba o arquivo `.env` real para o GitHub
- Mude a senha `APP_PASSWORD` antes de colocar em produção
- Agende o agente para rodar automaticamente nos PCs dos clientes
- Use sempre o Neon para produção (não SQLite)

Qualquer problema, me chama que eu ajudo.
