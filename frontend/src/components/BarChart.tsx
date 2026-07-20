'use client';
import ReactECharts from 'echarts-for-react';

type Item = { categoria: string; porcentaje: number; cantidad: number };
export function BarChart({ titulo, data }: { titulo: string; data: Item[] }) {
  const orden = [...data].sort((a, b) => a.porcentaje - b.porcentaje);
  const option = {
    grid: { left: 8, right: 48, top: 8, bottom: 8, containLabel: true },
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: (p: any) => {
        const d = orden[p[0].dataIndex];
        return `${d.categoria}<br/><b>${(d.porcentaje * 100).toFixed(1)}%</b> · ${d.cantidad} egresados`;
      },
    },
    xAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` } },
    yAxis: { type: 'category', data: orden.map((d) => d.categoria), axisTick: { show: false } },
    series: [{
      type: 'bar', data: orden.map((d) => d.porcentaje),
      itemStyle: { color: '#0B3B2E', borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: 'right', formatter: (p: any) => `${(p.value * 100).toFixed(1)}%`, color: '#5B6B65', fontSize: 11 },
      barMaxWidth: 22,
    }],
  };
  return (
    <div className="card card-hover p-4">
      <h3 className="text-sm font-semibold text-ink mb-2">{titulo}</h3>
      <ReactECharts option={option} style={{ height: 320 }} notMerge lazyUpdate />
    </div>
  );
}
