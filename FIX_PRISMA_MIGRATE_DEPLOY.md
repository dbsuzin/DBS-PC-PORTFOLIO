================================================================================
           ERRO: "prisma generate && prisma migrate deploy && next build" exited with 1
================================================================================

Este é o erro mais comum agora.

CAUSA PRINCIPAL:
- `prisma migrate deploy` falha porque:
  1. Não existe pasta `prisma/migrations` com pelo menos 1 migration
  2. O Vercel está usando versão errada do Prisma (7.x em vez de 5.22.0)
  3. DATABASE_URL não está configurada corretamente no Vercel

================================================================================
SOLUÇÃO COMPLETA (FAÇA NA ORDEM)
================================================================================

1. BAIXE O NOVO ZIP (já atualizado)
   - Baixe: pc-portfolio-vercel-neon.zip (o mais recente)

2. SUBSTITUA OS ARQUIVOS IMPORTANTES
   Copie estes arquivos para dentro do seu projeto:
   - package.json
   - vercel.json
   - prisma/schema.prisma
   - prisma/migrations/   (pasta inteira — MUITO IMPORTANTE)
   - DEPLOY_GITHUB_VERCEL_NEON.md

3. VERIFIQUE AS VARIÁVEIS DE AMBIENTE NO VERCEL (CRÍTICO!)
   - Vá em seu projeto no Vercel
   - Settings → Environment Variables
   - Confirme que existe:
     Name: DATABASE_URL
     Value: a string COMPLETA do Neon (deve começar com postgresql://)
     Environment: Production (e Preview se quiser)

   Se não existir, adicione agora.

4. NO GITHUB DESKTOP
   - Abra o projeto
   - Stage all changes
   - Commit com mensagem:
     "Fix: add initial Prisma migration + pin Prisma 5.22.0 in vercel.json"
   - Push

5. NO VERCEL - REDEPLOY
   - Deployments → clique nos 3 pontinhos do último deploy → Redeploy

================================================================================
SE AINDA DER ERRO APÓS ISSO
================================================================================

Abra o deployment que falhou e clique em "Build Logs" para ver o erro completo.

Possíveis erros e soluções:

A. "P1001: Can't reach database server"
   → DATABASE_URL está errada ou incompleta no Vercel.
   → Copie novamente a Connection String do Neon.

B. "The table does not exist"
   → A migration não foi aplicada.
   → Use o comando abaixo no terminal (depois de clonar o projeto):

   npx prisma@5.22.0 migrate deploy

C. "Prisma schema validation" ou "Cannot find module"
   → O vercel.json agora força a versão 5.22.0.

================================================================================
COMANDO ALTERNATIVO (SE QUISER DEPLOYAR MAIS RÁPIDO)
================================================================================

Se continuar dando problema com migrate, você pode temporariamente mudar o build:

No vercel.json mude para:

"buildCommand": "npx prisma@5.22.0 generate && npx prisma@5.22.0 db push && next build"

Mas o ideal é manter `migrate deploy`.

================================================================================
RESUMO DO QUE FOI CORRIGIDO NESTE ZIP
================================================================================

- Next.js 16.2.10 (sem vulnerabilidade)
- Prisma fixado em 5.22.0 no vercel.json
- Pasta prisma/migrations com migration inicial criada
- vercel.json atualizado para usar versão pinada
- Schema com PostgreSQL

================================================================================
