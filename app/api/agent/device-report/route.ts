import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get('key') || '';
  const companyName = searchParams.get('company') || '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>DBS - Reportar Aparelho</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0a;
      color: #e4e4e7;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
    }
    .logo { font-size: 28px; font-weight: 700; color: #38bdf8; margin-bottom: 4px; }
    .sub { font-size: 13px; color: #71717a; margin-bottom: 24px; }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      padding: 20px;
      width: 100%;
      max-width: 400px;
    }
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 11px; color: #a1a1aa; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .field input, .field select, .field textarea {
      width: 100%;
      background: #0f0f11;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 10px 12px;
      color: #e4e4e7;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .field input:focus, .field select:focus { border-color: #38bdf8; }
    .field .auto-tag {
      display: inline-block;
      font-size: 9px;
      background: #38bdf820;
      color: #38bdf8;
      padding: 1px 6px;
      border-radius: 4px;
      margin-left: 6px;
      border: 1px solid #38bdf830;
    }
    .btn {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 6px;
    }
    .btn-primary { background: #38bdf8; color: #0a0a0a; }
    .btn-primary:active { background: #0ea5e9; transform: scale(0.98); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .status { text-align: center; padding: 16px; font-size: 14px; }
    .status.ok { color: #4ade80; }
    .status.err { color: #f87171; }
    .status .icon { font-size: 40px; display: block; margin-bottom: 8px; }
    .loading { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 40px; }
    .spinner { width: 24px; height: 24px; border: 3px solid #27272a; border-top-color: #38bdf8; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .section-title { font-size: 11px; color: #52525b; text-transform: uppercase; letter-spacing: 1px; margin: 18px 0 10px; border-top: 1px solid #27272a; padding-top: 14px; }
    .battery-bar { height: 4px; background: #27272a; border-radius: 2px; margin-top: 6px; overflow: hidden; }
    .battery-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
    .detected-info { font-size: 12px; color: #71717a; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="logo">PC Portfolio</div>
  <div class="sub">Reportar Aparelho</div>

  <div class="card" id="form-card">
    <div class="loading" id="detecting">
      <div class="spinner"></div>
      <span style="color:#71717a">Detectando aparelho...</span>
    </div>

    <form id="device-form" style="display:none" onsubmit="submitDevice(event)">
      <div class="field">
        <label>Nome do Aparelho *</label>
        <input type="text" id="f-name" required placeholder="Ex: iPhone 15 do João">
      </div>

      <div class="section-title">Detectado Automaticamente</div>

      <div class="detected-info" id="detected-manufacturer"></div>
      <div class="detected-info" id="detected-model"></div>
      <div class="detected-info" id="detected-os"></div>

      <input type="hidden" id="f-manufacturer">
      <input type="hidden" id="f-model">
      <input type="hidden" id="f-os">
      <input type="hidden" id="f-osVersion">

      <div class="section-title">Informações Adicionais</div>

      <div class="field">
        <label>IMEI</label>
        <input type="text" id="f-imei" placeholder="Opcional">
      </div>
      <div class="field">
        <label>Número de Telefone</label>
        <input type="tel" id="f-phoneNumber" placeholder="Opcional">
      </div>
      <div class="field">
        <label>Armazenamento (GB)</label>
        <input type="number" id="f-storageGB" placeholder="Ex: 128">
      </div>
      <div class="field">
        <label>RAM (GB)</label>
        <input type="number" id="f-ramGB" placeholder="Ex: 6">
      </div>
      <div class="field">
        <label>Observações</label>
        <textarea id="f-notes" rows="2" placeholder="Opcional" style="width:100%;background:#0f0f11;border:1px solid #27272a;border-radius:8px;padding:10px 12px;color:#e4e4e7;font-size:14px;outline:none;resize:none"></textarea>
      </div>

      <button type="submit" class="btn btn-primary" id="submit-btn">Enviar Relatório</button>
    </form>

    <div id="result" style="display:none"></div>
  </div>

  <script>
    const API_KEY = ${JSON.stringify(apiKey)};
    const COMPANY = ${JSON.stringify(companyName)};

    function parseUserAgent(ua) {
      const info = { manufacturer: '', model: '', os: '', osVersion: '' };

      if (ua.includes('iPhone') || ua.includes('iPad')) {
        info.os = 'iOS';
        info.manufacturer = 'Apple';
        const match = ua.match(/OS (\\d+)_?(\\d*)/);
        info.osVersion = match ? match[1] + (match[2] ? '.' + match[2] : '') : '';
        if (ua.includes('iPhone')) {
          const models = {
            'iPhone15,4': 'iPhone 15', 'iPhone15,5': 'iPhone 15 Plus',
            'iPhone16,1': 'iPhone 15 Pro', 'iPhone16,2': 'iPhone 15 Pro Max',
            'iPhone14,7': 'iPhone 14', 'iPhone14,8': 'iPhone 14 Plus',
            'iPhone15,2': 'iPhone 14 Pro', 'iPhone15,3': 'iPhone 14 Pro Max',
            'iPhone13,1': 'iPhone 12 mini', 'iPhone13,2': 'iPhone 12',
            'iPhone13,3': 'iPhone 12 Pro', 'iPhone13,4': 'iPhone 12 Pro Max',
            'iPhone14,4': 'iPhone 13 mini', 'iPhone14,5': 'iPhone 13',
            'iPhone14,2': 'iPhone 13 Pro', 'iPhone14,3': 'iPhone 13 Pro Max',
            'iPhone15,6': 'iPhone 15', 'iPhone15,7': 'iPhone 15 Plus',
            'iPhone16,3': 'iPhone 15 Pro', 'iPhone16,4': 'iPhone 15 Pro Max',
            'iPhone17,1': 'iPhone 16 Pro', 'iPhone17,2': 'iPhone 16 Pro Max',
            'iPhone17,3': 'iPhone 16', 'iPhone17,4': 'iPhone 16 Plus',
          };
          const idMatch = ua.match(/iPhone([\\d,]+)[\\s]/);
          info.model = models[idMatch?.[1]] || 'iPhone';
        } else {
          info.model = 'iPad';
        }
      } else if (ua.includes('Android')) {
        info.os = 'Android';
        const match = ua.match(/Android (\\d+\\.?\\d*)/);
        info.osVersion = match ? match[1] : '';
        const manufacturers = {
          'Samsung': ['SM-', 'GT-', 'Samsung', 'samsung'],
          'Xiaomi': ['Mi ', 'Redmi', 'POCO', 'Xiaomi', 'xiaomi', 'M2012K11AG', 'M2101K6G'],
          'Motorola': ['Moto', 'moto', 'Motorola', 'motorola', 'XT'],
          'OnePlus': ['OnePlus', 'oneplus', 'KB20', 'LE21', 'IN20'],
          'Huawei': ['Huawei', 'huawei', 'HUAWEI', 'Honor', 'HONOR'],
          'Google': ['Pixel', 'pixel', 'Pixel'],
          'Realme': ['Realme', 'realme', 'RMX'],
          'Nothing': ['Nothing', 'nothing', 'A065'],
          'OPPO': ['OPPO', 'oppo', 'CPH', 'Reno'],
          'Vivo': ['vivo', 'Vivo', 'V2'],
          'LG': ['LG-', 'LG '],
        };
        for (const [brand, patterns] of Object.entries(manufacturers)) {
          if (patterns.some(p => ua.includes(p))) { info.manufacturer = brand; break; }
        }
        const modelMatch = ua.match(/;\\s*([^;)]+)\\s*Build/);
        if (modelMatch) info.model = modelMatch[1].trim();
      } else if (ua.includes('Windows')) {
        info.os = 'Windows';
        const match = ua.match(/Windows NT (\\d+\\.\\d+)/);
        const versions = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
        info.osVersion = versions[match?.[1]] || match?.[1] || '';
        info.manufacturer = 'PC (Browser)';
        info.model = 'Desktop';
      } else {
        info.os = 'Unknown';
        info.manufacturer = 'Unknown';
        info.model = 'Unknown';
      }

      return info;
    }

    async function detectDevice() {
      const ua = navigator.userAgent;
      const info = parseUserAgent(ua);

      document.getElementById('f-manufacturer').value = info.manufacturer;
      document.getElementById('f-model').value = info.model;
      document.getElementById('f-os').value = info.os;
      document.getElementById('f-osVersion').value = info.osVersion;

      document.getElementById('detected-manufacturer').textContent = 'Fabricante: ' + (info.manufacturer || 'Não detectado');
      document.getElementById('detected-model').textContent = 'Modelo: ' + (info.model || 'Não detectado');
      document.getElementById('detected-os').textContent = 'SO: ' + info.os + ' ' + info.osVersion;

      if ('getBattery' in navigator) {
        try {
          const battery = await navigator.getBattery();
          const updateBattery = () => {
            const pct = Math.round(battery.level * 100);
            const color = pct <= 20 ? '#f87171' : pct <= 50 ? '#fbbf24' : '#4ade80';
            document.getElementById('detected-os').textContent += ' | Bateria: ' + pct + '%';
          };
          battery.addEventListener('levelchange', updateBattery);
          updateBattery();
        } catch(e) {}
      }

      document.getElementById('detecting').style.display = 'none';
      document.getElementById('device-form').style.display = 'block';
    }

    async function submitDevice(e) {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      btn.disabled = true;
      btn.textContent = 'Enviando...';

      const data = {
        apiKey: API_KEY,
        name: document.getElementById('f-name').value.trim(),
        manufacturer: document.getElementById('f-manufacturer').value,
        model: document.getElementById('f-model').value,
        os: document.getElementById('f-os').value,
        osVersion: document.getElementById('f-osVersion').value,
        imei: document.getElementById('f-imei').value || undefined,
        phoneNumber: document.getElementById('f-phoneNumber').value || undefined,
        storageGB: document.getElementById('f-storageGB').value || undefined,
        ramGB: document.getElementById('f-ramGB').value || undefined,
        notes: document.getElementById('f-notes').value || undefined,
      };

      try {
        const res = await fetch('/api/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = document.getElementById('result');
        if (res.ok) {
          result.innerHTML = '<div class="status ok"><span class="icon">&#10003;</span>Aparelho reportado com sucesso!<br><small style="color:#71717a;margin-top:8px;display:block">Pode fechar esta página.</small></div>';
        } else {
          const err = await res.json();
          result.innerHTML = '<div class="status err"><span class="icon">&#10007;</span>' + (err.error || 'Erro ao enviar') + '</div>';
          btn.disabled = false;
          btn.textContent = 'Enviar Relatório';
        }
        document.getElementById('device-form').style.display = 'none';
        result.style.display = 'block';
      } catch (err) {
        document.getElementById('result').innerHTML = '<div class="status err"><span class="icon">&#10007;</span>Erro de conexão. Tente novamente.</div>';
        document.getElementById('result').style.display = 'block';
        document.getElementById('device-form').style.display = 'none';
      }
    }

    detectDevice();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
