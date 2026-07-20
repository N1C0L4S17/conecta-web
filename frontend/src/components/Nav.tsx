'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart3, LogOut, FileDown, Users, Upload, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ANALISTA', 'CONSULTA'] },
  { href: '/reports', label: 'Reportes', icon: FileDown, roles: ['ADMIN', 'ANALISTA'] },
  { href: '/import', label: 'Importar', icon: Upload, roles: ['ADMIN'] },
  { href: '/admin', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
];

export function Nav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('conecta_token')) {
      router.replace('/login');
    }
  }, [router]);

  // Cierra el menú móvil al navegar
  useEffect(() => { setOpen(false); }, [pathname]);

  const rol = user?.rol ?? 'CONSULTA';
  const links = LINKS.filter((l) => l.roles.includes(rol));

  return (
    <header className="bg-forest sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-white min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          <BarChart3 size={20} className="shrink-0" />
          <span className="font-display font-semibold tracking-tight truncate">CONECTA URP</span>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link key={l.href} href={l.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors whitespace-nowrap ${
                  active ? 'text-white font-medium' : 'text-forest-light/70 hover:text-white'
                }`}>
                <Icon size={15} /> {l.label}
                {active && <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-brand rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4 text-sm shrink-0">
          <span className="text-forest-light/70">{user?.nombre} · {rol}</span>
          <button onClick={logout} className="flex items-center gap-1 text-forest-light/70 hover:text-brand transition-colors">
            <LogOut size={16} /> Salir
          </button>
        </div>

        <button type="button" onClick={() => setOpen((o) => !o)}
          className="md:hidden text-white p-1.5 -mr-1.5 shrink-0" aria-label="Abrir menú">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-forest-dark">
          <nav className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
            {links.map((l) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href}
                  className={`flex items-center gap-2 px-2 py-2.5 text-sm rounded-md transition-colors ${
                    active ? 'text-white font-medium bg-white/10' : 'text-forest-light/70 hover:text-white'
                  }`}>
                  <Icon size={16} /> {l.label}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between px-2">
              <span className="text-xs text-forest-light/70 truncate">{user?.nombre} · {rol}</span>
              <button onClick={logout}
                className="flex items-center gap-1 text-sm text-forest-light/70 hover:text-brand transition-colors shrink-0">
                <LogOut size={16} /> Salir
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
