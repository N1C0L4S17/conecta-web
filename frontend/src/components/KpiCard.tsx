'use client';
import { useState } from 'react';
import { LucideIcon, Briefcase, Building2, CheckCircle2, Star, Clock, History, Rocket, Activity } from 'lucide-react';

type Props = { clave?: string; titulo: string; valor: number; formato: string; detalle?: string };

const ICONO: Record<string, LucideIcon> = {
  tasaEmpleo: Activity,
  tasaSectorPrivado: Building2,
  tasaAdecuacion: CheckCircle2,
  indiceSatisfaccion: Star,
  tasaMenos6: Clock,
  tasaMenos12: History,
  tasaEmprendimiento: Rocket,
};

// Acento magenta para los indicadores de mayor atención; el resto usa el verde institucional.
const ACENTO_BRAND = new Set(['indiceSatisfaccion', 'tasaEmprendimiento']);

export function KpiCard({ clave = '', titulo, valor, formato, detalle }: Props) {
  const [volteada, setVolteada] = useState(false);

  const texto = formato === 'pct' ? `${Math.round(valor * 100)}%`
    : formato === 'indice' ? `${valor}/5`
    : valor.toString();

  const Icon = ICONO[clave] ?? Briefcase;
  const esBrand = ACENTO_BRAND.has(clave);
  const borde = esBrand ? 'border-brand' : 'border-forest';

  return (
    <button type="button" onClick={() => setVolteada((v) => !v)}
      className="appearance-none bg-transparent p-0 border-0 text-left w-full min-h-[124px] [perspective:1000px] cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
      aria-label={`${titulo}: ${texto}. Presiona para ver más detalle.`}>
      <div className="relative w-full h-full min-h-[124px] transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: volteada ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>

        {/* Cara frontal */}
        <div className={`card card-hover absolute inset-0 p-5 border-l-[5px] flex flex-col justify-between [backface-visibility:hidden] ${borde}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
            esBrand ? 'bg-brand/10 text-brand' : 'bg-forest/10 text-forest'
          }`}>
            <Icon size={17} />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wide">{titulo}</span>
            <div className="font-display text-3xl font-bold text-forest leading-tight tabular-nums mt-0.5">{texto}</div>
            {detalle && <div className="text-xs text-muted mt-0.5">{detalle}</div>}
          </div>
        </div>

        {/* Cara trasera — vacía por ahora, luego se define el contenido */}
        <div className={`card absolute inset-0 p-5 border-l-[5px] flex items-center justify-center [backface-visibility:hidden] ${borde}`}
          style={{ transform: 'rotateY(180deg)' }}>
          <span className="text-xs text-outline">Próximamente</span>
        </div>
      </div>
    </button>
  );
}
