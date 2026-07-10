================================================================================
           ERRO 500 NO AGENTE - CORREÇÃO APLICADA
================================================================================

O erro que você viu:
"❌ Erro ao enviar: O servidor remoto retornou um erro: (500) Erro Interno do Servidor."

Isso aconteceu porque o script estava enviando números como texto em alguns casos, ou o banco rejeitou o valor.

✅ O QUE FOI CORRIGIDO:

1. No script PowerShell (agent.ps1):
   - Todos os valores numéricos (ramGB, diskGB, cpuCores) agora são forçados como [double] e [int]
   - Adicionado tratamento de erro mais detalhado (mostra a resposta do servidor)

2. No backend (API):
   - Adicionado conversão segura de números e datas (safeNumber + safeDate)
   - Agora aceita tanto string quanto número do PowerShell

3. Melhor logging no script:
   - Agora mostra exatamente o que o servidor respondeu quando dá erro

================================================================================
INSTRUÇÕES PARA VOCÊ AGORA
================================================================================

1. Baixe o novo `scripts/agent.ps1` (já atualizado)

2. Rode novamente com o comando que já funciona:

   powershell -ExecutionPolicy Bypass -Command ".\agent.ps1 -ApiKey 'cmre532k50001q4my81fh5uk2'"

3. Se ainda der erro, o script agora vai mostrar a resposta detalhada do servidor.

Cole aqui a mensagem completa que aparecer (especialmente a parte "Resposta do servidor" ou "Server response").

================================================================================
