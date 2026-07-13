# =====================================================
# Script para gerar agent.exe usando PS2EXE
# =====================================================

# 1. Instalar PS2EXE (se não tiver)
if (-not (Get-Module -ListAvailable -Name ps2exe)) {
    Write-Host "Instalando PS2EXE..." -ForegroundColor Cyan
    Install-Module -Name ps2exe -Force -Scope CurrentUser
}

# 2. Gerar o .exe
Write-Host "Gerando agent.exe..." -ForegroundColor Cyan
Invoke-PS2EXE -InputFile "$PSScriptRoot\agent.ps1" -OutputFile "$PSScriptRoot\agent.exe" -NoConsole -Force

Write-Host "Prquivo gerado: $PSScriptRoot\agent.exe" -ForegroundColor Green
Write-Host ""
Write-Host "Uso:" -ForegroundColor Yellow
Write-Host '  .\agent.exe -ApiKey "SUA_API_KEY"'
