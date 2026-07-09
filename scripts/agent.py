#!/usr/bin/env python3
"""
PC Portfolio Agent - Python
Coleta informações do sistema e envia para o PC Portfolio.

Uso:
    python agent.py --api-key SUA_API_KEY --url https://seu-app.vercel.app

Ou defina as variáveis de ambiente:
    PC_PORTFOLIO_API_KEY=xxx
    PC_PORTFOLIO_URL=https://seu-app.vercel.app/api/agent/report
"""

import requests
import platform
import socket
import psutil
import json
import argparse
import os
from datetime import datetime
from typing import Optional, Dict, Any

def get_env_or_arg(key: str, default: Optional[str] = None) -> Optional[str]:
    return os.environ.get(key) or default

def get_os_install_date() -> Optional[str]:
    """Tenta obter a data de instalação do sistema operacional."""
    system = platform.system()
    
    if system == "Windows":
        try:
            import winreg
            key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                                r"SOFTWARE\Microsoft\Windows NT\CurrentVersion")
            install_date = winreg.QueryValueEx(key, "InstallDate")[0]
            winreg.CloseKey(key)
            # Convert Windows timestamp to ISO
            return datetime.fromtimestamp(install_date).isoformat()
        except:
            pass
    
    elif system == "Linux":
        try:
            # Try /var/log/installer or apt history
            for log in ["/var/log/installer/syslog", "/var/log/apt/history.log"]:
                if os.path.exists(log):
                    with open(log) as f:
                        for line in f:
                            if "install" in line.lower() or "start" in line.lower():
                                # rough parse
                                return None  # fallback below
            # Fallback: use oldest file in /etc or /var
            import glob
            files = glob.glob("/var/log/*.log") + glob.glob("/etc/*")
            if files:
                oldest = min(files, key=os.path.getctime)
                return datetime.fromtimestamp(os.path.getctime(oldest)).isoformat()
        except:
            pass
    
    elif system == "Darwin":  # macOS
        try:
            import subprocess
            result = subprocess.run(
                ["sysctl", "-n", "kern.boottime"], 
                capture_output=True, text=True
            )
            # Not exact, but close
        except:
            pass
    
    return None

def get_last_boot_time() -> Optional[str]:
    """Obtém a data/hora da última inicialização."""
    try:
        boot_time = psutil.boot_time()
        return datetime.fromtimestamp(boot_time).isoformat()
    except:
        return None

def get_system_info() -> Dict[str, Any]:
    """Coleta todas as informações do sistema."""
    try:
        uname = platform.uname()
        
        info: Dict[str, Any] = {
            "hostname": uname.node,
            "manufacturer": "Unknown",
            "model": "Unknown",
            "serialNumber": None,
            "cpu": platform.processor() or uname.processor,
            "cpuCores": psutil.cpu_count(logical=False),
            "ramGB": round(psutil.virtual_memory().total / (1024 ** 3), 1),
            "diskGB": None,
            "gpu": None,
            "os": platform.system(),
            "osVersion": platform.release(),
            "osInstallDate": get_os_install_date(),
            "lastBootTime": get_last_boot_time(),
            "ipAddress": None,
            "macAddress": None,
            "biosVersion": None,
        }

        # Disk
        try:
            partitions = psutil.disk_partitions()
            total_disk = 0
            for part in partitions:
                if 'cdrom' not in part.opts.lower():
                    try:
                        usage = psutil.disk_usage(part.mountpoint)
                        total_disk += usage.total
                    except:
                        pass
            if total_disk > 0:
                info["diskGB"] = round(total_disk / (1024 ** 3), 1)
        except:
            pass

        # Windows specific
        if platform.system() == "Windows":
            try:
                import wmi
                c = wmi.WMI()
                
                # Computer system
                for item in c.Win32_ComputerSystem():
                    info["manufacturer"] = item.Manufacturer or "Unknown"
                    info["model"] = item.Model or "Unknown"
                    break

                # BIOS
                for item in c.Win32_BIOS():
                    info["serialNumber"] = item.SerialNumber
                    info["biosVersion"] = item.SMBIOSBIOSVersion
                    break

                # Network (MAC)
                for iface in psutil.net_if_addrs().values():
                    for addr in iface:
                        if hasattr(addr, 'family') and addr.family == getattr(psutil, 'AF_LINK', 17):
                            if addr.address and addr.address != '00:00:00:00:00:00':
                                info["macAddress"] = addr.address
                                break

            except ImportError:
                print("⚠️  Windows: pip install wmi para mais detalhes")
            except Exception as e:
                print(f"⚠️  Windows info error: {e}")

        # IP
        try:
            info["ipAddress"] = socket.gethostbyname(socket.gethostname())
        except:
            pass

        # Clean None values
        return {k: v for k, v in info.items() if v is not None}

    except Exception as e:
        print(f"Erro ao coletar informações: {e}")
        return {}

def send_report(api_url: str, api_key: str) -> bool:
    """Envia o relatório para a API."""
    info = get_system_info()
    if not info:
        print("❌ Não foi possível coletar informações do sistema.")
        return False

    info["apiKey"] = api_key

    print(f"📤 Enviando relatório para {api_url}...")
    print(f"   Hostname: {info.get('hostname')}")
    print(f"   OS: {info.get('os')} {info.get('osVersion', '')}")

    try:
        response = requests.post(
            api_url,
            json=info,
            timeout=20,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code in (200, 201):
            data = response.json()
            print(f"✅ Sucesso! Computador registrado/atualizado.")
            print(f"   ID: {data.get('computerId') or data.get('id')}")
            return True
        else:
            print(f"❌ Erro {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Falha na conexão: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="PC Portfolio Agent")
    parser.add_argument("--api-key", help="API Key da empresa")
    parser.add_argument("--url", help="URL do endpoint (ex: https://seuapp.vercel.app/api/agent/report)")
    parser.add_argument("--once", action="store_true", help="Executar apenas uma vez (padrão)")
    
    args = parser.parse_args()

    api_key = get_env_or_arg("PC_PORTFOLIO_API_KEY", args.api_key)
    base_url = get_env_or_arg("PC_PORTFOLIO_URL", args.url)

    if not base_url:
        base_url = "https://seu-app.vercel.app/api/agent/report"

    if not api_key:
        print("❌ API Key é obrigatória!")
        print("Use --api-key SUA_CHAVE ou defina PC_PORTFOLIO_API_KEY")
        return

    if not base_url.startswith("http"):
        base_url = f"https://{base_url}"

    success = send_report(base_url, api_key)
    
    if not success:
        exit(1)

if __name__ == "__main__":
    main()
