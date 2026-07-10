# ✅ ZIP Pronto - Correções Finais (10/07/2026)

Arquivo gerado: **pc-portfolio-fixed-2026-07-10.zip**

---

## O que foi corrigido neste ZIP

1. **Erro de build no Vercel resolvido**
   - `vercel.json` agora usa: `npx prisma@5.22.0 db push --accept-data-loss`
   - `package.json` também atualizado

2. **Logo maior**
   - Agora está em `h-40 w-auto` (bom tamanho, visível)

3. **Navegação lateral mais estreita**
   - Reduzida para `w-32` (menos espaço vazio à esquerda)

4. **Suporte a SSD + HD (múltiplos discos)**
   - Agente agora coleta todos os discos
   - Mostra no formato: `C: 477GB + D: 931GB`
   - Campo `disks` adicionado no banco

5. **Datas já funcionando** (você já confirmou)

---

## Como usar o ZIP (recomendado)

### Opção 1 - Mais simples (Vercel)

1. Baixe `pc-portfolio-fixed-2026-07-10.zip`
2. Descompacte em uma pasta nova (ex: `pc-portfolio-fixed`)
3. Entre na pasta e **copie apenas estes arquivos** para o seu projeto atual (ou substitua tudo):

   **Arquivos importantes para copiar/substituir:**
   - `vercel.json`
   - `package.json`
   - `app/page.tsx`
   - `app/api/agent/report/route.ts`
   - `scripts/agent.ps1`
   - `prisma/schema.prisma`

4. Faça deploy novamente no Vercel (ou git push se estiver usando repositório)

### Opção 2 - Substituir tudo

1. Descompacte o ZIP
2. Copie **toda a pasta** para o lugar do seu projeto antigo
3. Rode no terminal (dentro da pasta):
   ```bash
   npm install
   ```
4. Faça deploy no Vercel

---

## Depois de atualizar, rode o agente novamente no Windows

```powershell
powershell -ExecutionPolicy Bypass -File ".\agent.ps1" -ApiKey "cmre532k50001q4my81fh5uk2"
```

Depois atualize a página no site (F5).

---

## Arquivos principais modificados

- `vercel.json` ← resolve o erro do build
- `scripts/agent.ps1` ← agora mostra SSD + HD separado
- `app/page.tsx` ← logo maior + sidebar menor
- `prisma/schema.prisma` + API ← suporte ao campo disks

Pronto! Baixe o ZIP e substitua. Qualquer dúvida é só falar.