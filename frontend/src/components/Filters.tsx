'use client';
import { MultiSelect, Opcion } from './MultiSelect';

type Props = {
  opciones: any;
  filtros: Record<string, any>;
  onChange: (f: Record<string, any>) => void;
};

const TIEMPO_LABEL: Record<string, string> = {
  MENOS_3M: 'Menos de 3 meses', ENTRE_3_6M: 'Entre 3 y 6 meses',
  ENTRE_6_12M: 'Entre 6 meses y 1 año', ENTRE_1_2A: 'Entre 1 y 2 años', MAS_2A: 'Más de 2 años',
};

export function Filters({ opciones, filtros, onChange }: Props) {
  if (!opciones) return null;
  const set = (k: string, v: (string | number)[]) => onChange({ ...filtros, [k]: v });
  const val = (k: string): (string | number)[] => filtros[k] ?? [];

  const activos = Object.values(filtros).some((v) => Array.isArray(v) && v.length > 0);

  return (
    <div className="card p-4 flex flex-wrap gap-3 items-start">
      <MultiSelect label="Año egreso" seleccion={val('anioEgreso')}
        onChange={(v) => set('anioEgreso', v)}
        opciones={opciones.aniosEgreso.map((a: number): Opcion => ({ value: a, label: String(a) }))} />

      <MultiSelect label="Facultad" seleccion={val('facultad')}
        onChange={(v) => set('facultad', v)}
        opciones={opciones.facultades.map((f: string): Opcion => ({ value: f, label: f }))} />

      <MultiSelect label="Escuela" seleccion={val('escuelaId')}
        onChange={(v) => set('escuelaId', v)}
        opciones={opciones.escuelas.map((e: any): Opcion => ({ value: e.id, label: e.nombre }))} />

      <MultiSelect label="Rubro" seleccion={val('rubroId')}
        onChange={(v) => set('rubroId', v)}
        opciones={opciones.rubros.map((r: any): Opcion => ({ value: r.id, label: r.nombre }))} />

      <MultiSelect label="Nivel cargo" seleccion={val('nivelCargoId')}
        onChange={(v) => set('nivelCargoId', v)}
        opciones={opciones.niveles.map((n: any): Opcion => ({ value: n.id, label: n.nombre }))} />

      <MultiSelect label="Sector" seleccion={val('tipoEmpleo')}
        onChange={(v) => set('tipoEmpleo', v)}
        opciones={[{ value: 'PRIVADA', label: 'Privada' }, { value: 'PUBLICA', label: 'Pública' }]} />

      <MultiSelect label="Tiempo 1er empleo" seleccion={val('tiempoPrimerEmpleo')}
        onChange={(v) => set('tiempoPrimerEmpleo', v)}
        opciones={opciones.tiempos.map((t: string): Opcion => ({ value: t, label: TIEMPO_LABEL[t] }))} />

      {activos && (
        <button onClick={() => onChange({})}
          className="text-sm text-brand hover:underline ml-auto self-center">Limpiar filtros</button>
      )}
    </div>
  );
}
