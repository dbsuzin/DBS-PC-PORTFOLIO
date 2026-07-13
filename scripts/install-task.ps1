# =====================================================
# Criar tarefa agendada para rodar o agent na inicialização
# =====================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,

    [string]$Url = "https://dbs-pc-portfolio.vercel.app/api/agent/report",

    [string]$ScriptPath = "C:\Script_dbs\scripts\agent.ps1"
)

$taskName = "PCPortfolio_Agent"

# Remover tarefa existente se houver
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Criar ação
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`" -ApiKey `"$ApiKey`" -Url `"$Url`""

# Criar gatilho (inicialização do sistema)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Configurações
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

# Registrar tarefa
Register-ScheduledTask -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Reporta informações do PC para o DBS PC Portfolio" `
    -RunLevel Highest

Write-Host "Tarefa '$taskName' criada com sucesso!" -ForegroundColor Green
Write-Host "O agente será executado a cada inicialização do Windows." -ForegroundColor Cyan
