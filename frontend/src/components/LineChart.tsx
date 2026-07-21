'use client';
import ReactECharts from 'echarts-for-react';

type Punto = { anio: number; tasa: number; empleados: number; total: number };
export function LineChart({ titulo, data }: { titulo: string; data: Punto[] }) {
  const option = {
    grid: { left: 8, right: 20, top: 20, bottom: 24, containLabel: true },
    tooltip: {
      trigger: 'axis',
      formatter: (p: any) => {
        const d = data[p[0].dataIndex];
        return `Egreso ${d.anio}<br/><b>${(d.tasa * 100).toFixed(1)}%</b> empleo · ${d.empleados}/${d.total}`;
      },
    },
    xAxis: { type: 'category', data: data.map((d) => d.anio), boundaryGap: false },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${(v * 100).toFixed(0)}%` }, max: 1 },
    series: [{
      type: 'line', smooth: true, data: data.map((d) => d.tasa),
      itemStyle: { color: '#B50062' }, areaStyle: { color: 'rgba(0,54,30,0.10)' },
      lineStyle: { color: '#00361E' },
      label: { show: true, formatter: (p: any) => `${(p.value * 100).toFixed(0)}%`, fontSize: 10, color: '#414942' },
    }],
  };
  return (
    <div className="card card-hover p-4">
      <h3 className="text-sm font-semibold text-ink mb-2">{titulo}</h3>
      <ReactECharts option={option} style={{ height: 280 }} notMerge lazyUpdate />
    </div>
  );
}
