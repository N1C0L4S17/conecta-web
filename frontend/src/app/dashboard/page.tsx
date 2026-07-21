'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Nav } from '@/components/Nav';
import { KpiCard } from '@/components/KpiCard';
import { BarChart } from '@/components/BarChart';
import { LineChart } from '@/components/LineChart';
import { Filters } from '@/components/Filters';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [opciones, setOpciones] = useState<any>(null);
  const [filtros, setFiltros] = useState<Record<string, any>>({});
  const [kpis, setKpis] = useState<any>(null);
  const [rubro, setRubro] = useState<any[]>([]);
  const [cargo, setCargo] = useState<any[]>([]);
  const [porAnio, setPorAnio] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Redirige si no hay sesión
  useEffect(() => {
    const t = sessionStorage.getItem('conecta_token');
    if (!t) router.replace('/login');
  }, [router]);

  useEffect(() => { api.filtros().then(setOpciones).catch(() => {}); }, []);

  const cargar = useCallback(async (f: Record<string, any>) => {
    setLoading(true);
    try {
      const [k, r, c, a] = await Promise.all([api.kpis(f), api.rubro(f), api.cargo(f), api.empleoPorAnio(f)]);
      setKpis(k); setRubro(r); setCargo(c); setPorAnio(a);
    } catch (e: any) {
      if (String(e.message).includes('401')) router.replace('/login');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { cargar(filtros); }, [filtros, cargar]);

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <Filters opciones={opciones} filtros={filtros} onChange={setFiltros} />

        {kpis && (
          <p className="text-sm text-muted">
            <b className="text-ink">{kpis.totales.encuestados.toLocaleString()}</b> encuestados ·{' '}
            <b className="text-ink">{kpis.totales.empleados.toLocaleString()}</b> empleados
          </p>
        )}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis?.kpis.map((k: any) => (
            <KpiCard key={k.clave} clave={k.clave} titulo={k.titulo} valor={k.valor} formato={k.formato} detalle={k.detalle} />
          ))}
        </section>

        <LineChart titulo="Tasa de empleo por año de egreso" data={porAnio} />

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BarChart titulo="% Distribución por Rubro" data={rubro} />
          <BarChart titulo="% Distribución por Cargo" data={cargo} />
        </section>
      </main>
    </div>
  );
}
