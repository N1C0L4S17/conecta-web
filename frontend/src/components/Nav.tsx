'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BarChart3, LogOut, FileDown, Users, Upload, LayoutDashboard } from 'lucide-react';
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

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('conecta_token')) {
      router.replace('/login');
    }
  }, [router]);

  const rol = user?.rol ?? 'CONSULTA';

  return (
    <header className="bg-forest sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
            </span>
            <BarChart3 size={20} />
            <span className="font-display font-semibold tracking-tight">CONECTA URP</span>
          </div>
          <nav className="flex items-center gap-1">
            {LINKS.filter((l) => l.roles.includes(rol)).map((l) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                    active ? 'text-white font-medium' : 'text-forest-light/70 hover:text-white'
                  }`}>
                  <Icon size={15} /> {l.label}
                  {active && <span className="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-brand rounded-full" />}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-forest-light/70 hidden sm:inline">{user?.nombre} · {rol}</span>
          <button onClick={logout} className="flex items-center gap-1 text-forest-light/70 hover:text-brand transition-colors">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}
