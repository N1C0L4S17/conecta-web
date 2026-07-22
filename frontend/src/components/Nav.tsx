'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { BarChart3, LogOut, FileDown, Users, Upload, LayoutDashboard, Menu, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ANALISTA', 'CONSULTA'] },
  { href: '/reports', label: 'Reportes', icon: FileDown, roles: ['ADMIN', 'ANALISTA'] },
  { href: '/import', label: 'Importar', icon: Upload, roles: ['ADMIN'] },
  { href: '/admin', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
];

function Brand({ expanded = true }: { expanded?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 text-forest overflow-hidden">
      <div className="w-9 h-9 bg-forest rounded-xl flex items-center justify-center shrink-0">
        <BarChart3 size={18} className="text-white" />
      </div>
      <div className={`min-w-0 overflow-hidden transition-all duration-200 ${expanded ? 'max-w-[180px] opacity-100' : 'max-w-0 opacity-0'}`}>
        <p className="font-display font-bold text-sm leading-tight truncate whitespace-nowrap">CONECTA URP</p>
        <p className="text-[10px] text-outline uppercase tracking-widest truncate whitespace-nowrap">Analítica de Egresados</p>
      </div>
    </div>
  );
}

export function Nav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const railRef = useRef<HTMLElement>(null);

  // Colapsa el rail al hacer clic fuera de él
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (expanded && railRef.current && !railRef.current.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [expanded]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('conecta_token')) {
      router.replace('/login');
    }
  }, [router]);

  // Cierra el menú móvil y colapsa el rail al navegar
  useEffect(() => { setOpen(false); setExpanded(false); }, [pathname]);

  const rol = user?.rol ?? 'CONSULTA';
  const links = LINKS.filter((l) => l.roles.includes(rol));

  return (
    <>
      {/* Sidebar — escritorio (md+), desplegable */}
      <aside ref={railRef}
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-40 overflow-hidden
        transition-[width] duration-300 ease-in-out
        bg-white/85 glass-nav border-r border-forest/10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.06)] px-3 py-5 ${
          expanded ? 'md:w-[280px] shadow-floating' : 'md:w-[76px]'
        }`}>
        <div className="mb-4 px-1"><Brand expanded={expanded} /></div>

        <button type="button" onClick={() => setExpanded((e) => !e)} title={expanded ? 'Contraer menú' : 'Expandir menú'}
          className="mb-4 flex items-center justify-center w-full py-1.5 rounded-xl text-outline hover:text-forest hover:bg-forest/5 transition-colors shrink-0">
          {expanded ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
        </button>

        <nav className="flex-1 space-y-1 px-1">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href} title={l.label}
                className={`flex items-center gap-3 py-2.5 rounded-xl text-sm transition-all border-l-4 overflow-hidden ${
                  expanded ? 'px-3' : 'px-0 justify-center'
                } ${
                  active
                    ? 'text-forest font-semibold border-forest bg-forest/5'
                    : 'text-muted border-transparent hover:text-forest hover:bg-forest/5'
                }`}>
                <Icon size={17} className="shrink-0" />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${expanded ? 'max-w-[160px] opacity-100' : 'max-w-0 opacity-0'}`}>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pt-3 mt-3 border-t border-forest/10">
          <div className={`overflow-hidden transition-all duration-200 ${expanded ? 'max-h-12 opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
            <p className="text-xs font-medium text-ink truncate whitespace-nowrap">{user?.nombre}</p>
            <p className="text-[11px] text-outline uppercase tracking-wide truncate whitespace-nowrap">{rol}</p>
          </div>
          <button onClick={logout} title="Salir"
            className={`flex items-center gap-2 rounded-xl text-sm text-muted hover:text-brand hover:bg-brand/5 transition-colors overflow-hidden ${
              expanded ? 'w-full px-3 py-2' : 'w-10 h-10 justify-center mx-auto'
            }`}>
            <LogOut size={16} className="shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${expanded ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0'}`}>
              Salir
            </span>
          </button>
        </div>
      </aside>

      {/* Barra superior — móvil (<md) */}
      <header className="md:hidden sticky top-0 z-30 glass-nav border-b border-forest/10">
        <div className="px-4 h-14 flex items-center justify-between gap-2">
          <Brand />
          <button type="button" onClick={() => setOpen((o) => !o)}
            className="text-forest p-1.5 -mr-1.5 shrink-0" aria-label="Abrir menú">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="border-t border-forest/10 bg-white">
            <nav className="px-3 py-2 flex flex-col">
              {links.map((l) => {
                const active = pathname === l.href;
                const Icon = l.icon;
                return (
                  <Link key={l.href} href={l.href}
                    className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-colors ${
                      active ? 'text-forest font-semibold bg-forest/5' : 'text-muted hover:text-forest hover:bg-forest/5'
                    }`}>
                    <Icon size={16} /> {l.label}
                  </Link>
                );
              })}
              <div className="mt-2 pt-2 border-t border-forest/10 flex items-center justify-between px-3">
                <span className="text-xs text-outline truncate">{user?.nombre} · {rol}</span>
                <button onClick={logout}
                  className="flex items-center gap-1 text-sm text-muted hover:text-brand transition-colors shrink-0">
                  <LogOut size={16} /> Salir
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

