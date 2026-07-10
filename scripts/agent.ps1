# PC Portfolio Agent - PowerShell (Windows) - VERSAO ROBUSTA
#
# Se der erro de "nao esta assinado digitalmente", rode:
# powershell -ExecutionPolicy Bypass -File ".\agent.ps1" -ApiKey "SUA_CHAVE"

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [string]$Url = "https://dbs-pc-portfolio.vercel.app/api/agent/report"
)

$info = @{}
$info.hostname = $env:COMPUTERNAME
$info.apiKey   = $ApiKey

# Coleta simples
try {
    $cs = Get-CimInstance Win32_ComputerSystem
    $info.manufacturer = $cs.Manufacturer
    $info.model = $cs.Model
    $info.ramGB = [double]([math]::Round($cs.TotalPhysicalMemory / 1GB, 1))
} catch {}

try {
    $bios = Get-CimInstance Win32_BIOS
    $info.serialNumber = $bios.SerialNumber
    $info.biosVersion = $bios.SMBIOSBIOSVersion
} catch {}

try {
    $cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
    $info.cpu = $cpu.Name
    $info.cpuCores = [int]$cpu.NumberOfCores
} catch {}

try {
    $disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
    $total = ($disks | Measure-Object -Property Size -Sum).Sum
    $info.diskGB = [double]([math]::Round($total / 1GB, 1))

    # Detalhes por disco (SSD + HD)
    $diskList = @()
    foreach ($d in $disks) {
        $sizeGB = [math]::Round($d.Size / 1GB, 0)
        $diskList += "$($d.DeviceID) ${sizeGB}GB"
    }
    $info.disks = ($diskList -join " + ")
} catch {}

# === DATAS (MÉTODO MAIS ROBUSTO COM MÚLTIPLOS FALLBACKS) ===
try {
    $os = Get-CimInstance Win32_OperatingSystem
    $info.os = $os.Caption
    $info.osVersion = $os.Version

    # === Data de Instalação do SO ===
    $installDate = $null

    # 1. CIM Win32_OperatingSystem.InstallDate (mais confiável)
    if ($os.InstallDate) {
        $installDate = $os.InstallDate
        Write-Host "  [DEBUG] InstallDate via CIM: $($os.InstallDate)" -ForegroundColor DarkGray
    }

    # 2. Registro Windows (InstallDate como FILETIME)
    if (-not $installDate) {
        try {
            $reg = Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name InstallDate -ErrorAction SilentlyContinue
            if ($reg -and $reg.InstallDate) {
                $installDate = [DateTime]::FromFileTime($reg.InstallDate)
                Write-Host "  [DEBUG] InstallDate via Registry: $installDate" -ForegroundColor DarkGray
            }
        } catch {}
    }

    # 3. Data de criação do arquivo do kernel (último recurso)
    if (-not $installDate) {
        try {
            $kernelFiles = @(
                "$env:SystemRoot\System32\kernel32.dll",
                "$env:SystemRoot\System32\ntdll.dll",
                "$env:SystemRoot\System32\win32k.sys"
            )
            foreach ($f in $kernelFiles) {
                if (Test-Path $f) {
                    $installDate = (Get-Item $f).CreationTime
                    Write-Host "  [DEBUG] InstallDate via File Creation: $installDate" -ForegroundColor DarkGray
                    break
                }
            }
        } catch {}
    }

    if ($installDate) {
        # Forçar string ISO 8601 (formato "o")
        $info.osInstallDate = $installDate.ToString("o")
    } else {
        Write-Host "  [AVISO] osInstallDate não foi possível determinar" -ForegroundColor Yellow
    }

    # === Última Inicialização (Last Boot Time) ===
    if ($os.LastBootUpTime) {
        $info.lastBootTime = $os.LastBootUpTime.ToString("o")
        Write-Host "  [DEBUG] LastBootUpTime via CIM: $($os.LastBootUpTime)" -ForegroundColor DarkGray
    } else {
        Write-Host "  [AVISO] lastBootTime não encontrado no CIM" -ForegroundColor Yellow
        # Fallback: tentar via Get-Date com uptime (aproximação)
        try {
            $uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
            if ($uptime) {
                $approxBoot = (Get-Date).Add(-$uptime)
                $info.lastBootTime = $approxBoot.ToString("o")
                Write-Host "  [DEBUG] LastBoot via uptime approx: $approxBoot" -ForegroundColor DarkGray
            }
        } catch {}
    }

    # Mostrar o que será enviado
    Write-Host "  [ENVIANDO] osInstallDate: $($info.osInstallDate)" -ForegroundColor Cyan
    Write-Host "  [ENVIANDO] lastBootTime: $($info.lastBootTime)" -ForegroundColor Cyan

} catch {
    Write-Host "  Erro ao coletar datas do SO: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | 
           Where-Object { $_.IPAddress -notmatch '^(127|169)\.' } | 
           Select-Object -First 1).IPAddress
    $info.ipAddress = $ip
} catch {}

try {
    $mac = (Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | 
            Select-Object -First 1).MacAddress
    $info.macAddress = $mac
} catch {}

try {
    $gpu = Get-CimInstance Win32_VideoController | Select-Object -First 1
    if ($gpu) { $info.gpu = $gpu.Name }
} catch {}

# Envio
Write-Host "Enviando para $Url ..." -ForegroundColor Cyan
Write-Host "   Hostname: $($info.hostname)"

try {
    $body = $info | ConvertTo-Json -Depth 3 -Compress
    $response = Invoke-RestMethod -Uri $Url -Method Post -Body $body -ContentType "application/json" -TimeoutSec 25

    Write-Host "Sucesso! Computador registrado/atualizado." -ForegroundColor Green
    if ($response.computerId) {
        Write-Host "   ID: $($response.computerId)"
    }
}
catch {
    Write-Host "Erro ao enviar:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $errBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errBody)
            Write-Host "Detalhes: $($reader.ReadToEnd())" -ForegroundColor Red
        } catch {}
    }
    exit 1
}
