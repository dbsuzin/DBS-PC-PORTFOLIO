# Resumo das correções aplicadas (10/07/2026)

## 1. Logo aumentada
- Logo agora está em **h-[300px]** (muito maior).
- Se ainda quiser ajustar, me diga o tamanho desejado (ex: 200px).

## 2. Duplicados corrigidos (agora cria/atualiza apenas 1)
- `/api/agent/report/route.ts` reescrito com **deduplicação agressiva**:
  - Busca **todos** os registros com o mesmo hostname (case-insensitive)
  - Atualiza o registro mais recente
  - **Deleta automaticamente** todos os duplicados
- Também melhorado o GET (`/api/computers`) para deduplicar no carregamento da tabela
- Rode o agente **mais uma vez** para limpar duplicados antigos

## 3. Datas agora devem aparecer
- Parsing de datas muito mais robusto (aceita o formato exato que você enviou: `2024-11-26T08:59:03.0000000-03:00`)
- Logs detalhados no servidor (veremos em produção)
- Funções de formatação melhoradas no frontend (tratam Date e string)

### O que o agente enviou corretamente:
```
[ENVIANDO] osInstallDate: 2024-11-26T08:59:03.0000000-03:00
[ENVIANDO] lastBootTime: 2026-06-30T09:09:20.7199420-03:00
```

### Passos obrigatórios agora:

1. **Rode o agente novamente** (com o script atualizado no servidor):
```powershell
powershell -ExecutionPolicy Bypass -File ".\agent.ps1" -ApiKey "cmre532k50001q4my81fh5uk2"
```

2. No site:
   - Selecione a empresa
   - Clique no botão **Refresh** (ícone circular)
   - Ou pressione F5

3. As colunas **Inst. SO** e **Últ. Boot** devem mostrar:
   - 26/11/2024
   - 30/06/2026 09:09

Se ainda aparecer "—", me envie:
- A saída completa do PowerShell
- Screenshot da linha do DBS-PC

---

**Arquivos principais atualizados:**
- `app/page.tsx` → logo grande + formatação de data mais segura
- `app/api/agent/report/route.ts` → dedup + parsing forte + logs
- `app/api/computers/route.ts` → dedup na listagem

Pronto para novo teste! Rode o agente agora.
