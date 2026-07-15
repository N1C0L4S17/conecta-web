'use client';
type Props = { titulo: string; valor: number; formato: string; detalle?: string };

export function KpiCard({ titulo, valor, formato, detalle }: Props) {
  const texto = formato === 'pct' ? `${(valor * 100).toFixed(1)}%` : valor.toString();
  return (
    <div className="card card-hover p-4 flex flex-col justify-between min-h-[104px]">
      <span className="text-xs font-medium text-muted uppercase tracking-wide">{titulo}</span>
      <div>
        <div className="text-3xl font-semibold text-brand leading-tight">{texto}</div>
        {detalle && <div className="text-xs text-muted mt-0.5">{detalle}</div>}
      </div>
    </div>
  );
}
