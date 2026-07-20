'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { BarChart3, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Ingrese su correo y contraseña');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-light to-white px-4">
      <div className="card w-full max-w-sm p-8">

        <div className="flex items-center gap-2 text-brand mb-6">
          <BarChart3 size={28} />

          <div>
            <h1 className="text-lg font-semibold text-ink">
              CONECTA URP
            </h1>

            <p className="text-xs text-muted">
              Analítica de Egresados
            </p>
          </div>
        </div>

        <form onSubmit={submit}>

          <label className="block text-sm text-muted mb-1">
            Correo electrónico
          </label>

          <input
            type="email"
            required
            autoComplete="email"
            placeholder="usuario@urp.edu.pe"
            className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-sm text-muted mb-1">
            Contraseña
          </label>

          <div className="relative mb-4">

            <input
              type={mostrarPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="Ingrese su contraseña"
              className="w-full border rounded-md px-3 py-2 pr-10 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              {mostrarPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>

          {error && (
            <p className="text-sm text-red-600 mb-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white rounded-md py-2 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}

            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

        </form>

        <p className="text-xs text-muted mt-5 text-center">
          Acceso exclusivo para usuarios registrados.
        </p>

      </div>
    </div>
  );
}
