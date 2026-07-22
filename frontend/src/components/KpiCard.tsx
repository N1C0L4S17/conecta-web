'use client';

import { useState } from 'react';
import {
  LucideIcon,
  Briefcase,
  Building2,
  CheckCircle2,
  Star,
  Clock,
  History,
  Rocket,
  Activity,
} from 'lucide-react';

type Props = {
  clave?: string;
  titulo: string;
  valor: number;
  formato: string;
  detalle?: string;
};

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
const ACENTO_BRAND = new Set([
  'indiceSatisfaccion',
  'tasaEmprendimiento',
]);

export function KpiCard({
  clave = '',
  titulo,
  valor,
  formato,
  detalle,
}: Props) {
  const [volteada, setVolteada] = useState(false);

  // ==========================
  // CONTENIDO DE LA PARTE TRASERA
  // ==========================
  const CONTENIDO_TRASERO: Record<
    string,
    {
      titulo: string;
      descripcion: string;
    }
  > = {
    tasaEmpleo: {
      titulo: 'Tasa de Empleo',
      descripcion:
        'Representa el porcentaje de egresados que actualmente cuentan con un empleo.',
    },

    tasaSectorPrivado: {
      titulo: 'Sector Privado',
      descripcion:
        'Indica el porcentaje de egresados que trabajan en empresas privadas.',
    },

    tasaAdecuacion: {
      titulo: 'Adecuación Laboral',
      descripcion:
        'Mide cuántos egresados desempeñan un trabajo relacionado con su carrera profesional.',
    },

    indiceSatisfaccion: {
      titulo: 'Satisfacción Laboral',
      descripcion:
        'Promedio de satisfacción de los egresados respecto a su empleo actual.',
    },

    tasaMenos6: {
      titulo: 'Inserción en menos de 6 meses',
      descripcion:
        'Porcentaje de egresados que consiguieron empleo antes de cumplir seis meses de egreso.',
    },

    tasaMenos12: {
      titulo: 'Inserción en menos de 12 meses',
      descripcion:
        'Porcentaje de egresados que consiguieron empleo antes de cumplir doce meses de egreso.',
    },

    tasaEmprendimiento: {
      titulo: 'Emprendimiento',
      descripcion:
        'Porcentaje de egresados que desarrollan un negocio o emprendimiento propio.',
    },
  };

  const info = CONTENIDO_TRASERO[clave];

  const texto =
    formato === 'pct'
      ? `${Math.round(valor * 100)}%`
      : formato === 'indice'
      ? `${valor}/5`
      : valor.toString();

  const Icon = ICONO[clave] ?? Briefcase;
  const esBrand = ACENTO_BRAND.has(clave);
  const borde = esBrand ? 'border-brand' : 'border-forest';

  return (
    <button
      type="button"
      onClick={() => setVolteada((v) => !v)}
      className="w-full h-[180px] cursor-pointer rounded-2xl overflow-hidden [perspective:1200px] focus:outline-none"
      aria-label={`${titulo}: ${texto}`}
    >
      <div
        className="relative w-full h-full duration-500 flip-container"
        style={{
        transform: volteada ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Cara frontal */}
        <div
          className={`absolute top-0 left-0 w-full h-full card card-hover border-l-[5px] flip-front ${borde}`}
        >

        <div className="flex flex-col justify-between h-full p-5">

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              esBrand
                ? 'bg-brand/10 text-brand'
                : 'bg-forest/10 text-forest'
            }`}
          >
            <Icon size={17} />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wide">
              {titulo}
            </span>

            <div className="font-display text-3xl font-bold text-forest leading-tight mt-1">
              {texto}
            </div>

            {detalle && (
              <div className="text-xs text-muted mt-1">
                {detalle}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Cara trasera */}
        <div
        className={`absolute top-0 left-0 w-full h-full card border-l-[5px] flip-back ${borde}`}
        >

        <div className="flex flex-col justify-center items-center h-full p-5 text-center">

          <h3 className="text-lg font-bold text-forest mb-3">
            {info?.titulo ?? titulo}
          </h3>

          <p className="text-sm text-muted leading-relaxed">
            {info?.descripcion ??
              'No hay información disponible para este indicador.'}
          </p>

        </div>

      </div>
      </div>
    </button>
  );
}
