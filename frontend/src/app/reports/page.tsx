'use client';
import { useEffect, useState } from 'react';
import { FileDown, FileSpreadsheet, FileText, Table } from 'lucide-react';
import { api } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { Filters } from '@/components/Filters';

export default function ReportsPage() {
  const [opciones, setOpciones] = useState<any>(null);
  const [filtros, setFiltros] = useState<Record<string, any>>({});
  const [descargando, setDescargando] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => { api.filtros().then(setOpciones).catch(() => {}); }, []);

  const descargar = async (formato: 'csv' | 'excel' | 'pdf') => {
    setError(''); setDescargando(formato);
    try { await api.descargar(formato, filtros); }
    catch (e: any) { setError(e.message); }
    finally { setDescargando(''); }
  };

  const cards = [
    { fmt: 'excel' as const, icon: FileSpreadsheet, titulo: 'Excel (.xlsx)', desc: 'Hoja de KPIs + detalle de respuestas.' },
    { fmt: 'pdf' as const, icon: FileText, titulo: 'PDF', desc: 'Resumen ejecutivo de indicadores y distribuciones.' },
    { fmt: 'csv' as const, icon: Table, titulo: 'CSV', desc: 'Datos planos para análisis externo.' },
  ];

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="md:pl-[76px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
            <FileDown size={20} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-ink">Reportes</h1>
            <p className="text-sm text-muted">Los filtros aplicados se respetan en la exportación.</p>
          </div>
        </div>

        <Filters opciones={opciones} filtros={filtros} onChange={setFiltros} />
        {error && (
          <p className="text-sm text-error bg-error/5 border border-error/20 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map(({ fmt, icon: Icon, titulo, desc }) => (
            <div key={fmt} className="card card-hover p-5 flex flex-col gap-3">
              <div className="w-11 h-11 bg-forest/10 text-forest rounded-xl flex items-center justify-center">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-ink">{titulo}</h3>
                <p className="text-sm text-muted">{desc}</p>
              </div>
              <button onClick={() => descargar(fmt)} disabled={!!descargando}
                className="mt-2 bg-brand hover:bg-brand-dark text-white rounded-xl py-2.5 text-sm font-semibold shadow-lg shadow-brand/20 disabled:opacity-50 transition-all">
                {descargando === fmt ? 'Generando…' : 'Descargar'}
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
