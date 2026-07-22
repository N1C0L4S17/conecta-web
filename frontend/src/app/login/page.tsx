'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { BarChart3, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(''); setLoading(true);
    try { await login(email, password); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-mesh min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Elementos atmosféricos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-forest/20 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />

      <main className="relative z-10 w-full max-w-[440px]">
        <div className="bg-white/90 backdrop-blur-xl border border-forest/10 rounded-2xl shadow-floating p-8 sm:p-10 flex flex-col items-center">
          {/* Identidad de marca */}
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-12 h-12 bg-forest rounded-xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                <BarChart3 size={26} className="text-white" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold text-forest tracking-tight">CONECTA URP</h1>
            <p className="text-xs text-muted mt-1 font-medium uppercase tracking-wider">Analítica de Egresados</p>
          </div>

          <div className="w-full mb-6 text-center">
            <h2 className="text-xl font-semibold text-ink">Bienvenido de nuevo</h2>
            <p className="text-sm text-muted mt-0.5">Ingresa para ver el panel de egresados</p>
          </div>

          <div className="w-full space-y-4">
            {/* Correo */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-semibold text-muted ml-1 uppercase tracking-wide">
                Correo electrónico
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute inset-y-0 left-4 my-auto text-outline group-focus-within:text-forest transition-colors" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@urp.edu.pe"
                  className="w-full bg-surface-low border border-mist/60 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-ink placeholder:text-outline/60 focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all outline-none" />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="password" className="text-xs font-semibold text-muted uppercase tracking-wide">Contraseña</label>
                <button type="button" onClick={() => setShowRecovery((s) => !s)}
                  className="text-xs font-semibold text-brand hover:underline">¿Olvidaste tu contraseña?</button>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute inset-y-0 left-4 my-auto text-outline group-focus-within:text-forest transition-colors" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="••••••••"
                  className="w-full bg-surface-low border border-mist/60 rounded-2xl py-3.5 pl-12 pr-11 text-sm text-ink placeholder:text-outline/60 focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all outline-none" />
                <button type="button" onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-4 my-auto text-outline hover:text-forest transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {showRecovery && (
              <p className="text-xs text-forest bg-forest-light rounded-xl px-4 py-3 leading-relaxed">
                Escribe a <span className="font-semibold">ocsee@urp.edu.pe</span> para restablecer tu acceso.
              </p>
            )}

            {error && (
              <p className="text-sm text-error bg-error/5 border border-error/20 rounded-xl px-4 py-2.5">{error}</p>
            )}

            <button onClick={submit} disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark active:scale-[0.98] text-white font-semibold py-3.5 rounded-2xl shadow-lg shadow-brand/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100">
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Ingresando…</>
              ) : (
                <>Iniciar sesión <ArrowRight size={18} /></>
              )}
            </button>
          </div>

          <p className="text-xs text-muted mt-8 text-center">
            Acceso exclusivo para usuarios registrados.
          </p>
        </div>

        {/* Elementos decorativos */}
        <div className="mt-8 flex justify-center gap-3 opacity-60">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
          <div className="w-24 h-1 bg-brand/40 rounded-full" />
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>
      </main>
    </div>
  );
}
