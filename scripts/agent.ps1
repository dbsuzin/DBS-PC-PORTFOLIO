<#
.SYNOPSIS
    PC Portfolio Agent - PowerShell (Windows)
.DESCRIPTION
    Coleta informações detalhadas do PC e envia para o PC Portfolio.
.EXAMPLE
    .\agent.ps1 -ApiKey "sua-chave-aqui" -Url "https://seuapp.vercel.app/api/agent/report"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ApiKey,
    
    [Parameter(Mandatory=$false)]
    [string]$Url = "https://seu-app.vercel.app/api/agent/report"
)

# Load from environment if not provided
if (-not $ApiKey) { $ApiKey = $env:PC_PORTFOLIO_API_KEY }

if (-not $ApiKey) {
    Write-Host "❌ API Key é obrigatória!" -ForegroundColor Red
    Write-Host "Use: .\agent.ps1 -ApiKey SUA_CHAVE"
    Write-Host "Ou defina a variável: `$env:PC_PORTFOLIO_API_KEY = 'sua-chave'"
    exit 1
}

Write-Host "🔍 Coletando informações do sistema..." -ForegroundColor Cyan

$info = @{}

# Basic info
$info.hostname = $env:COMPUTERNAME
$info.apiKey = $ApiKey

# Computer System
try {
    $cs = Get-CimInstance Win32_ComputerSystem
    $info.manufacturer = $cs.Manufacturer
    $info.model = $cs.Model
} catch {}

# BIOS
try {
    $bios = Get-CimInstance Win32_BIOS
    $info.serialNumber = $bios.SerialNumber
    $info.biosVersion = $bios.SMBIOSBIOSVersion
} catch {}

# CPU
try {
    $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
    $info.cpu = $cpu.Name
    $info.cpuCores = $cpu.NumberOfCores
} catch {}

# RAM
try {
    $cs = Get-CimInstance Win32_ComputerSystem
    $info.ramGB = [math]::Round($cs.TotalPhysicalMemory / 1GB, 1)
} catch {}

# Disk (C: drive + total)
try {
    $disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
    $totalDisk = ($disks | Measure-Object -Property Size -Sum).Sum
    $info.diskGB = [math]::Round($totalDisk / 1GB, 1)
} catch {}

# Operating System + Dates
try {
    $os = Get-CimInstance Win32_OperatingSystem
    $info.os = $os.Caption
    $info.osVersion = $os.Version

    # OS Install Date
    if ($os.InstallDate) {
        $info.osInstallDate = $os.InstallDate.ToString("o")  # ISO 8601
    }

    # Last Boot Time
    if ($os.LastBootUpTime) {
        $info.lastBootTime = $os.LastBootUpTime.ToString("o")
    }
} catch {}

# IP Address
try {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | 
           Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*" } |
           Select-Object -First 1).IPAddress
    $info.ipAddress = $ip
} catch {}

# MAC Address
try {
    $mac = (Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | 
            Select-Object -First 1).MacAddress
    $info.macAddress = $mac
} catch {}

# GPU (optional)
try {
    $gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
    if ($gpu) { $info.gpu = $gpu.Name }
} catch {}

# Send to API
Write-Host "📤 Enviando para $Url..." -ForegroundColor Yellow
Write-Host "   Hostname: $($info.hostname)"
Write-Host "   OS: $($info.os) - Instalado em: $($info.osInstallDate)"
Write-Host "   Última inicialização: $($info.lastBootTime)"

try {
    $body = $info | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri $Url `
                                  -Method Post `
                                  -Body $body `
                                  -ContentType "application/json" `
                                  -TimeoutSec 20

    Write-Host "✅ Sucesso! Computador registrado." -ForegroundColor Green
    if ($response.computerId) {
        Write-Host "   ID: $($response.computerId)"
    }
} 
catch {
    Write-Host "❌ Erro ao enviar:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}
