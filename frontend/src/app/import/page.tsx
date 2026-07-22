'use client';
import { useState } from 'react';
import { Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { Nav } from '@/components/Nav';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState<'' | 'validar' | 'cargar'>('');
  const [error, setError] = useState('');

  const validar = async () => {
    if (!file) return;
    setError(''); setResultado(null); setLoading('validar');
    try { setPreview(await api.importarExcel(file, true)); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(''); }
  };

  const cargar = async () => {
    if (!file) return;
    setError(''); setLoading('cargar');
    try {
      const r = await api.importarExcel(file, false);
      setResultado(r); setPreview(null);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(''); }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="md:pl-[280px]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-ink flex items-center gap-2">
            <Upload size={20} className="text-brand" /> Importar Excel
          </h1>
          <p className="text-sm text-muted">
            Sube un archivo con la hoja <code>Form_Responses3</code>. Se valida antes de cargar;
            la carga reemplaza los datos de la campaña correspondiente.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-mist rounded-2xl py-8 px-4 text-center hover:border-forest/40 hover:bg-forest/[0.02] transition-colors cursor-pointer">
            <Upload size={22} className="text-forest/60" />
            <span className="text-sm text-muted">
              {file ? <b className="text-ink">{file.name}</b> : 'Haz clic para seleccionar un archivo .xlsx'}
            </span>
            <input type="file" accept=".xlsx,.xls"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setPreview(null); setResultado(null); }}
              className="hidden" />
          </label>
          <div className="flex gap-3">
            <button onClick={validar} disabled={!file || !!loading}
              className="border border-brand text-brand rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-brand/5 transition-colors">
              {loading === 'validar' ? 'Validando…' : '1. Validar'}
            </button>
            <button onClick={cargar} disabled={!preview || !!loading}
              className="bg-brand hover:bg-brand-dark text-white rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg shadow-brand/20 disabled:opacity-50 transition-all">
              {loading === 'cargar' ? 'Cargando…' : '2. Confirmar carga'}
            </button>
          </div>
        </div>

        {error && (
          <div className="card p-4 rounded-2xl flex items-start gap-2 text-error bg-error/5 border-error/20">
            <AlertTriangle size={18} className="mt-0.5" /> <span className="text-sm">{error}</span>
          </div>
        )}

        {preview && (
          <div className="card p-4 space-y-2">
            <h3 className="font-semibold text-ink">Vista previa (sin guardar)</h3>
            <ul className="text-sm text-muted space-y-1">
              <li>Campaña: <b className="text-ink">{preview.campaniaAnio}</b></li>
              <li>Filas: <b className="text-ink">{preview.totales.filas}</b> · válidas: {preview.totales.validas}</li>
              <li>Dimensiones → escuelas {preview.dimensiones.escuelas}, rubros {preview.dimensiones.rubros}, niveles {preview.dimensiones.niveles}</li>
            </ul>
            {preview.advertencias?.length > 0 && (
              <div className="text-xs text-amber-700 bg-amber-50 rounded-xl p-2">
                {preview.advertencias.map((a: string, i: number) => <div key={i}>⚠ {a}</div>)}
              </div>
            )}
          </div>
        )}

        {resultado && (
          <div className="card p-4 rounded-2xl flex items-start gap-2 text-forest bg-forest/5 border-forest/20">
            <CheckCircle2 size={18} className="mt-0.5" />
            <span className="text-sm">
              Carga completada: <b>{resultado.insertadas}</b> respuestas en la campaña {resultado.campaniaAnio}.
            </span>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
