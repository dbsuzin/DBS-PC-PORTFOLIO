# ✅ Atualizações Concluídas - PC Portfolio

## O que foi corrigido e melhorado:

### 1. Datas de SO e Última Inicialização (osInstallDate + lastBootTime)
- **scripts/agent.ps1** atualizado com **múltiplos fallbacks robustos**:
  1. CIM `Win32_OperatingSystem.InstallDate`
  2. Registro `HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\InstallDate` (FromFileTime)
  3. Data de criação dos arquivos do kernel (`kernel32.dll`, `ntdll.dll`)
- `lastBootTime` também usa CIM + fallback por uptime
- Sempre envia como string **ISO 8601** (`ToString("o")`)
- Logs de debug mostrados no PowerShell
- **Upsert** no servidor (`/api/agent/report`): atualiza PC existente em vez de duplicar

### 2. Logo DBS no sistema
- Logo já está em `public/dbs-logo.png`
- Exibida no cabeçalho: `<img src="/dbs-logo.png" className="h-9 w-auto" />`

### 3. Todas as informações na mesma linha (tabela mais compacta)
- Fonte reduzida para `text-[10px]`
- Colunas compactadas (px-2 py-1)
- Dados combinados em uma linha (ex: Fabricante/Modelo, SO/Versão)
- Tabela com `min-w-[1180px]` + `overflow-x-auto` (scroll horizontal se necessário)
- Padding do CSS reduzido
- Ações com ícones menores

### 4. Barra lateral de empresas reduzida
- Largura: `w-44`
- Padding e texto muito mais compactos (`text-xs`, `text-[9px]`)
- Espaçamento reduzido

---

## Como testar as datas agora (IMPORTANTE)

1. Copie o arquivo atualizado **`scripts/agent.ps1`** para o seu computador.

2. Abra o **PowerShell como Administrador**.

3. Rode **exatamente**:

```powershell
powershell -ExecutionPolicy Bypass -File ".\agent.ps1" -ApiKey "SUA_API_KEY_DA_EMPRESA"
```

Exemplo:
```powershell
powershell -ExecutionPolicy Bypass -File ".\agent.ps1" -ApiKey "cmre532k50001q4my81fh5uk2"
```

Você verá no console:
```
  [ENVIANDO] osInstallDate: 2024-...
  [ENVIANDO] lastBootTime: 2026-...
```

4. Atualize a página do site (`F5`) e verifique as colunas:
   - **Inst. SO**
   - **Últ. Boot**

Deve aparecer a data em vez de "—".

---

## Se ainda aparecer "—"

1. Rode o agente e **copie toda a saída** do PowerShell.
2. Cole aqui para análise.
3. Verifique se a data aparece no console como `[ENVIANDO]`.

---

## Arquivos principais alterados
- `scripts/agent.ps1` (agente robusto)
- `app/page.tsx` (UI compacta + logo)
- `app/api/agent/report/route.ts` (upsert + parsing seguro)
- `app/globals.css` (padding reduzido)

---

**Site:** https://dbs-pc-portfolio.vercel.app/

Tudo pronto! Rode o agente atualizado e as datas devem aparecer.