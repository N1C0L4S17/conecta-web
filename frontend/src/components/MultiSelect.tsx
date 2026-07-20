'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

export type Opcion = { value: string | number; label: string };

type Props = {
  label: string;
  opciones: Opcion[];
  seleccion: (string | number)[];
  onChange: (valores: (string | number)[]) => void;
};

/** Selector de múltiples valores con checkboxes y chips. */
export function MultiSelect({ label, opciones, seleccion, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggle = (v: string | number) =>
    onChange(seleccion.includes(v) ? seleccion.filter((x) => x !== v) : [...seleccion, v]);

  const labelDe = (v: string | number) => opciones.find((o) => o.value === v)?.label ?? String(v);

  return (
    <div className="flex flex-col gap-1 min-w-0" ref={ref}>
      <label className="text-[11px] font-medium text-muted uppercase truncate">{label}</label>
      <div className="relative min-w-0">
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="border border-mist rounded-md px-2 py-1.5 text-sm bg-white w-full flex items-center justify-between gap-2">
          <span className="truncate text-left">
            {seleccion.length === 0 ? <span className="text-neutral-400">Todos</span>
              : `${seleccion.length} seleccionado${seleccion.length > 1 ? 's' : ''}`}
          </span>
          <ChevronDown size={15} className="text-muted shrink-0" />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 left-0 w-[min(16rem,85vw)] max-h-64 overflow-auto bg-white border border-mist rounded-md shadow-lg py-1">
            {opciones.map((o) => (
              <label key={String(o.value)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-neutral-50 cursor-pointer">
                <input type="checkbox" checked={seleccion.includes(o.value)} onChange={() => toggle(o.value)} />
                <span className="truncate">{o.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {seleccion.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {seleccion.map((v) => (
            <span key={String(v)}
              className="inline-flex items-center gap-1 bg-brand-light text-brand text-[11px] rounded px-1.5 py-0.5 max-w-full">
              <span className="truncate">{labelDe(v)}</span>
              <button onClick={() => toggle(v)} className="shrink-0"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
