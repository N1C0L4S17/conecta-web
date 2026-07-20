'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(''); setLoading(true);
    try { await login(email, password); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-forest relative overflow-hidden px-4">
      {/* Grilla técnica sutil de fondo */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/20 blur-3xl" />

      <div className="relative w-full max-w-sm bg-paper rounded-xl border border-forest-dark/40 shadow-2xl p-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          <BarChart3 size={22} className="text-forest" />
          <h1 className="font-display text-lg font-semibold text-ink">CONECTA URP</h1>
        </div>
        <p className="text-xs text-muted font-mono uppercase tracking-wider mb-6">Analítica de Egresados</p>

        <label className="block text-sm text-muted mb-1">Correo electrónico</label>
        <input className="w-full border border-mist rounded-md px-3 py-2 mb-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-sm text-muted mb-1">Contraseña</label>
        <input type="password" className="w-full border border-mist rounded-md px-3 py-2 mb-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button onClick={submit} disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-md py-2 text-sm font-medium disabled:opacity-50 transition-colors">
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
        <p className="text-xs text-muted mt-4 text-center font-mono">
          Acceso exclusivo para usuarios registrados.
        </p>
      </div>
    </div>
  );
}
