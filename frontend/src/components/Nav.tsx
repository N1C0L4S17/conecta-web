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
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-brand">
            <BarChart3 size={22} />
            <span className="font-semibold text-ink">CONECTA URP</span>
          </div>
          <nav className="flex items-center gap-1">
            {LINKS.filter((l) => l.roles.includes(rol)).map((l) => {
              const active = pathname === l.href;
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm ${
                    active ? 'bg-brand-light text-brand font-medium' : 'text-muted hover:bg-neutral-100'
                  }`}>
                  <Icon size={15} /> {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted hidden sm:inline">{user?.nombre} · {rol}</span>
          <button onClick={logout} className="flex items-center gap-1 text-muted hover:text-brand">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>
    </header>
  );
}
