================================================================================
           ERRO: "não está assinado digitalmente" / Execution Policy
================================================================================

Esse é o erro MAIS COMUM no Windows quando se tenta rodar um script .ps1.

Mensagem que você recebeu:
"O arquivo ... não está assinado digitalmente. Não é possível executar este script no sistema atual."

================================================================================
SOLUÇÃO IMEDIATA (rode isso agora)
================================================================================

Abra o PowerShell **como Administrador** e rode o comando completo abaixo:

```powershell
powershell -ExecutionPolicy Bypass -File ".\agent.ps1" -ApiKey "cmre532k50001q4my81fh5uk2"
```

Ou, se você já estiver dentro da pasta C:\Script_dbs:

```powershell
powershell -ExecutionPolicy Bypass -Command ".\agent.ps1 -ApiKey 'cmre532k50001q4my81fh5uk2'"
```

Isso força o PowerShell a rodar o script **uma única vez** ignorando a política de segurança.

================================================================================
COMO DEIXAR PERMANENTE (recomendado)
================================================================================

Para nunca mais ter esse erro, rode **uma única vez** como Administrador:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois disso você pode rodar normalmente:

```powershell
.\agent.ps1 -ApiKey "cmre532k50001q4my81fh5uk2"
```

================================================================================
SE VOCÊ FOR AGENDAR NO AGENDADOR DE TAREFAS
================================================================================

No Agendador de Tarefas, use **sempre** este comando completo:

Programa/script:
```
powershell.exe
```

Adicionar argumentos:
```
-ExecutionPolicy Bypass -File "C:\Script_dbs\agent.ps1" -ApiKey "cmre532k50001q4my81fh5uk2"
```

================================================================================
COMANDO RÁPIDO DE UMA LINHA (para testar rápido)
================================================================================

```powershell
powershell -ExecutionPolicy Bypass -Command "cd C:\Script_dbs; .\agent.ps1 -ApiKey 'cmre532k50001q4my81fh5uk2'"
```

================================================================================
RESUMO DOS COMANDOS
================================================================================

| Objetivo                        | Comando que você deve usar                                      |
|--------------------------------|------------------------------------------------------------------|
| Testar agora (uma vez)         | `powershell -ExecutionPolicy Bypass -File ".\agent.ps1" -ApiKey "SUA_CHAVE"` |
| Deixar permanente              | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`           |
| Agendar no Windows             | Usar `-ExecutionPolicy Bypass` nos argumentos da tarefa         |
| Executar de qualquer lugar     | `powershell -ExecutionPolicy Bypass -Command ".\agent.ps1 -ApiKey 'SUA_CHAVE'"` |

================================================================================
DICA EXTRA
================================================================================

Se o computador for de empresa e a política for controlada por GPO (Active Directory), o `Set-ExecutionPolicy` pode não funcionar permanentemente.

Nesse caso, **sempre use** o comando com `-ExecutionPolicy Bypass`.

================================================================================
