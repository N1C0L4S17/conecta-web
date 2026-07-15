'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('analista@urp.edu.pe');
  const [password, setPassword] = useState('conecta2025');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(''); setLoading(true);
    try { await login(email, password); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-light to-white px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2 text-brand mb-6">
          <BarChart3 size={28} />
          <div>
            <h1 className="text-lg font-semibold text-ink">CONECTA URP</h1>
            <p className="text-xs text-muted">Analítica de Egresados</p>
          </div>
        </div>
        <label className="block text-sm text-muted mb-1">Correo</label>
        <input className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-sm text-muted mb-1">Contraseña</label>
        <input type="password" className="w-full border rounded-md px-3 py-2 mb-4 text-sm"
          value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <button onClick={submit} disabled={loading}
          className="w-full bg-brand hover:bg-brand-dark text-white rounded-md py-2 text-sm font-medium disabled:opacity-50">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
        <p className="text-xs text-muted mt-4 text-center">
          Demo: admin / analista / consulta @urp.edu.pe · conecta2025
        </p>
      </div>
    </div>
  );
}
