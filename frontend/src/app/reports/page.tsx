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
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-ink flex items-center gap-2">
            <FileDown size={20} className="text-brand" /> Reportes
          </h1>
          <p className="text-sm text-muted">Los filtros aplicados se respetan en la exportación.</p>
        </div>

        <Filters opciones={opciones} filtros={filtros} onChange={setFiltros} />
        {error && <p className="text-sm text-red-600">{error}</p>}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map(({ fmt, icon: Icon, titulo, desc }) => (
            <div key={fmt} className="card p-5 flex flex-col gap-3">
              <Icon size={28} className="text-brand" />
              <div>
                <h3 className="font-semibold text-ink">{titulo}</h3>
                <p className="text-sm text-muted">{desc}</p>
              </div>
              <button onClick={() => descargar(fmt)} disabled={!!descargando}
                className="mt-2 bg-brand hover:bg-brand-dark text-white rounded-md py-2 text-sm font-medium disabled:opacity-50">
                {descargando === fmt ? 'Generando…' : 'Descargar'}
              </button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
