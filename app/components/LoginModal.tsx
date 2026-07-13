'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // Success - reload to apply auth cookie properly
        window.location.reload();
        onLoginSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Senha incorreta');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-6">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900">
          <Lock className="h-8 w-8 text-blue-500" />
        </div>
        
        <h2 className="text-2xl font-semibold mb-1">Acesso Restrito</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Digite a senha para acessar o PC Portfolio
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              className="w-full pr-12"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/50 py-2 px-3 rounded">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || !password}
            className="btn btn-primary w-full py-3 mt-2 disabled:opacity-60"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-[10px] text-zinc-500">
          Defina a senha em <span className="font-mono">APP_PASSWORD</span> no .env
        </p>
      </div>
    </div>
  );
}
