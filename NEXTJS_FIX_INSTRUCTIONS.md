================================================================================
           CORREÇÃO: "Vulnerable version of Next.js detected"
================================================================================

O erro acontece porque o Vercel bloqueia versões antigas do Next.js por segurança.

**Versão atual no seu projeto:** 15.2.4 (vulnerável)
**Versão corrigida:** 16.2.10 (segura e atual)

================================================================================
PASSO A PASSO (USANDO GITHUB DESKTOP)
================================================================================

1. BAIXE O NOVO ZIP
   - Baixe: pc-portfolio-vercel-neon.zip (o mais recente)

2. SUBSTITUA OS ARQUIVOS
   - Extraia o ZIP
   - Copie e cole os seguintes arquivos sobre o seu projeto:
     • package.json
     • package-lock.json (importante!)
     • DEPLOY_GITHUB_VERCEL_NEON.md (atualizado)
   - Mantenha todos os outros arquivos (app/, prisma/, etc.)

3. NO GITHUB DESKTOP:
   - Abra sua pasta do projeto
   - Você vai ver mudanças em:
     - package.json
     - package-lock.json
   - Marque todos os arquivos (Stage all)
   - Escreva a mensagem:
     "Upgrade Next.js to 16.2.10 - fix Vercel vulnerable version error"
   - Clique em **Commit to main**
   - Clique em **Push origin**

4. NO VERCEL:
   - Vá até seu projeto
   - Clique em **Deployments**
   - Clique nos 3 pontinhos do último deploy → **Redeploy**
   - Ou espere o deploy automático começar (pode demorar 1-2 min)

================================================================================
SE AINDA DER ERRO DEPOIS DO PUSH
================================================================================

No Vercel:
1. Settings → General
2. Build & Development Settings
3. Build Command:
   prisma generate && prisma migrate deploy && next build
4. Clique em Save
5. Volte em Deployments e clique em Redeploy

================================================================================
ARQUIVOS QUE MUDARAM NESTA CORREÇÃO
================================================================================

- package.json → next: "16.2.10"
- package-lock.json (atualizado)
- DEPLOY_GITHUB_VERCEL_NEON.md (instruções atualizadas)

O resto do projeto continua exatamente igual.

================================================================================
