================================================================================
           ERRO ATUAL: Build falhou com "prisma migrate deploy"
================================================================================

O erro que você está vendo agora:

"Command \"prisma generate && prisma migrate deploy && next build\" exited with 1"

Isso acontece porque:
- Não havia migration inicial no projeto (agora tem)
- O Vercel estava usando versão errada do Prisma
- Ou DATABASE_URL não está 100% correta no Vercel

================================================================================
PASSOS EXATOS AGORA (GITHUB DESKTOP)
================================================================================

1. BAIXE O ZIP MAIS RECENTE
   pc-portfolio-vercel-neon.zip

2. COPIE ESTES ARQUIVOS PARA O SEU PROJETO:
   - vercel.json
   - package.json
   - prisma/schema.prisma
   - prisma/migrations/   ← pasta inteira (muito importante)
   - FIX_PRISMA_MIGRATE_DEPLOY.md

3. VERIFIQUE AS VARIÁVEIS DE AMBIENTE NO VERCEL (FAÇA ISSO AGORA)
   - Abra o projeto no Vercel
   - Vá em **Settings** → **Environment Variables**
   - Procure por **DATABASE_URL**
   - Ela DEVE estar presente e com o valor completo do Neon:
     Exemplo: postgresql://neondb_owner:xxxxxxxx@ep-abc123.us-east-1.aws.neon.tech/neondb?sslmode=require

   Se não estiver ou estiver incompleta → delete e adicione novamente.

4. NO GITHUB DESKTOP
   - Abra a pasta do projeto
   - Clique em "Stage all" 
   - Commit message:
     Fix Prisma migrate deploy + add initial migration
   - Push to origin

5. NO VERCEL
   - Vá em **Deployments**
   - Clique nos 3 pontinhos do deploy que falhou
   - Clique em **Redeploy**

Aguarde o novo build.

================================================================================
SE AINDA DER ERRO, FAÇA ISSO
================================================================================

1. No Vercel, abra o deploy que falhou
2. Clique em "Build Logs" (ou "View Build Logs")
3. Copie a mensagem de erro completa e cole aqui

Enquanto isso, você pode tentar o comando alternativo (temporário):

No vercel.json, troque o buildCommand por:
"npx prisma@5.22.0 generate && npx prisma@5.22.0 db push && next build"

Depois commit + push + redeploy.

Mas o ideal é manter migrate deploy.

================================================================================
