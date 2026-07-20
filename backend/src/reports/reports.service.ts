import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { FiltrosDto } from '../dashboard/dto/filtros.dto';
import { buildWhere } from '../common/where.util';

const TIEMPO: Record<string, string> = {
  MENOS_3M: 'Menos de 3 meses', ENTRE_3_6M: 'Entre 3 y 6 meses',
  ENTRE_6_12M: 'Entre 6 meses y 1 año', ENTRE_1_2A: 'Entre 1 y 2 años', MAS_2A: 'Más de 2 años',
};

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService, private dashboard: DashboardService) {}

  /** Filas planas (con nombres de dimensión) para cualquier exportación. */
  private async filas(f: FiltrosDto) {
    const where: Prisma.RespuestaEncuestaWhereInput = buildWhere(f);

    const rows = await this.prisma.respuestaEncuesta.findMany({
      where, include: { escuela: true, rubro: true, nivelCargo: true, campania: true },
      orderBy: { anioEgreso: 'desc' },
    });
    return rows.map((r) => ({
      Campania: r.campania.anio,
      AnioEgreso: r.anioEgreso ?? '',
      Facultad: r.escuela?.facultad ?? '',
      Escuela: r.escuela?.nombre ?? '',
      Trabajando: r.trabajando ? 'Sí' : 'No',
      Sector: r.tipoEmpleo ?? '',
      Rubro: r.rubro?.nombre ?? '',
      NivelCargo: r.nivelCargo?.nombre ?? '',
      Cargo: r.cargoTexto ?? '',
      Correspondencia: r.correspondencia ?? '',
      Satisfaccion: r.satisfaccion ?? '',
      TiempoPrimerEmpleo: r.tiempoPrimerEmpleo ? TIEMPO[r.tiempoPrimerEmpleo] : '',
      Ubicacion: r.ubicacion ?? '',
    }));
  }

  async csv(f: FiltrosDto): Promise<string> {
    const rows = await this.filas(f);
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const esc = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [headers.join(',')];
    for (const r of rows) lines.push(headers.map((h) => esc((r as any)[h])).join(','));
    return '\uFEFF' + lines.join('\n'); // BOM para acentos en Excel
  }

  async excel(f: FiltrosDto): Promise<Buffer> {
    const [rows, kpi] = await Promise.all([this.filas(f), this.dashboard.kpis(f)]);
    const wb = new ExcelJS.Workbook();
    wb.creator = 'CONECTA URP';

    // Hoja KPIs
    const kh = wb.addWorksheet('KPIs');
    kh.columns = [
      { header: 'Indicador', key: 't', width: 32 },
      { header: 'Valor', key: 'v', width: 14 },
      { header: 'Detalle', key: 'd', width: 20 },
    ];
    kh.getRow(1).font = { bold: true };
    kpi.kpis.forEach((k: any) =>
      kh.addRow({ t: k.titulo, v: `${(k.valor * 100).toFixed(1)}%`, d: k.detalle ?? '' }));
    kh.addRow({});
    kh.addRow({ t: 'Encuestados', v: kpi.totales.encuestados });
    kh.addRow({ t: 'Empleados', v: kpi.totales.empleados });

    // Hoja Datos
    const ds = wb.addWorksheet('Respuestas');
    if (rows.length) {
      ds.columns = Object.keys(rows[0]).map((h) => ({ header: h, key: h, width: 18 }));
      ds.getRow(1).font = { bold: true };
      rows.forEach((r) => ds.addRow(r));
    }
    return (await wb.xlsx.writeBuffer()) as unknown as Buffer;
  }

  // Paleta institucional CONECTA URP (coherente con el resto de la plataforma).
  private static readonly FOREST = '#0B3B2E';
  private static readonly FOREST_DARK = '#082A21';
  private static readonly FOREST_LIGHT = '#E6EEEA';
  private static readonly BRAND = '#D6006E';
  private static readonly INK = '#16211D';
  private static readonly MUTED = '#5B6B65';
  private static readonly MIST = '#E3E9E6';

  /** Dibuja un gráfico de barras horizontales (categoría + %) usando primitivas de PDFKit. */
  private dibujarBarras(
    doc: PDFKit.PDFDocument,
    data: { categoria: string; porcentaje: number; cantidad: number }[],
    x: number,
    y: number,
    width: number,
  ) {
    const { FOREST, BRAND, INK, MUTED, MIST } = ReportsService;
    const top5 = [...data].sort((a, b) => b.porcentaje - a.porcentaje).slice(0, 6);
    const labelW = 130;
    const barAreaW = width - labelW - 42;
    const rowH = 20;
    const maxPct = Math.max(...top5.map((d) => d.porcentaje), 0.0001);

    top5.forEach((d, i) => {
      const rowY = y + i * rowH;
      const barW = Math.max((d.porcentaje / maxPct) * barAreaW, 2);
      // etiqueta
      doc.fontSize(8).fillColor(INK)
        .text(d.categoria, x, rowY + 4, { width: labelW - 6, ellipsis: true, lineBreak: false });
      // pista de fondo
      doc.rect(x + labelW, rowY + 2, barAreaW, 12).fill(MIST);
      // barra: alterna verde/magenta para diferenciar visualmente el top categoría
      doc.rect(x + labelW, rowY + 2, barW, 12).fill(i === 0 ? BRAND : FOREST);
      // valor
      doc.fontSize(8).fillColor(MUTED)
        .text(`${(d.porcentaje * 100).toFixed(1)}%`, x + labelW + barAreaW + 4, rowY + 4, { width: 36 });
    });
    return y + top5.length * rowH;
  }

  /** Dibuja un mini gráfico de línea/área para la tasa de empleo por año. */
  private dibujarLinea(
    doc: PDFKit.PDFDocument,
    data: { anio: number; tasa: number }[],
    x: number,
    y: number,
    width: number,
    height: number,
  ) {
    const { FOREST, BRAND, MUTED, MIST } = ReportsService;
    if (data.length === 0) return y;
    const maxTasa = Math.max(...data.map((d) => d.tasa), 0.1);
    const stepX = width / Math.max(data.length - 1, 1);

    // ejes base
    doc.moveTo(x, y + height).lineTo(x + width, y + height).lineWidth(0.5).strokeColor(MIST).stroke();

    const puntos = data.map((d, i) => ({
      px: x + i * stepX,
      py: y + height - (d.tasa / maxTasa) * height,
      d,
    }));

    // área bajo la curva (verde muy suave)
    doc.moveTo(puntos[0].px, y + height);
    puntos.forEach((p) => doc.lineTo(p.px, p.py));
    doc.lineTo(puntos[puntos.length - 1].px, y + height).closePath().fillOpacity(0.12).fill(FOREST).fillOpacity(1);

    // línea
    doc.moveTo(puntos[0].px, puntos[0].py);
    puntos.slice(1).forEach((p) => doc.lineTo(p.px, p.py));
    doc.lineWidth(1.5).strokeColor(FOREST).stroke();

    // puntos + etiquetas de año
    puntos.forEach((p) => {
      doc.circle(p.px, p.py, 2).fill(BRAND);
      doc.fontSize(7).fillColor(MUTED).text(String(p.d.anio), p.px - 12, y + height + 4, { width: 24, align: 'center' });
    });

    return y + height + 16;
  }

  async pdf(f: FiltrosDto): Promise<Buffer> {
    const kpi = await this.dashboard.kpis(f);
    const [rubro, cargo, porAnio] = await Promise.all([
      this.dashboard.distribucionRubro(f),
      this.dashboard.distribucionCargo(f),
      this.dashboard.empleoPorAnio(f),
    ]);
    const { FOREST, FOREST_DARK, FOREST_LIGHT, BRAND, INK, MUTED } = ReportsService;

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      const pageW = doc.page.width;
      const marginX = 48;
      const contentW = pageW - marginX * 2;

      // ---- Cabecera ----
      doc.rect(0, 0, pageW, 86).fill(FOREST_DARK);
      doc.rect(0, 82, pageW, 4).fill(BRAND);
      doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('CONECTA URP', marginX, 26);
      doc.fillColor(FOREST_LIGHT).fontSize(11).font('Helvetica').text('Reporte de Egresados · Analítica institucional', marginX, 50);
      doc.fillColor(FOREST_LIGHT).fontSize(8)
        .text(`Generado el ${new Date().toLocaleString('es-PE')}`, marginX, 66);

      let y = 108;
      doc.fillColor(INK).fontSize(10).font('Helvetica-Bold')
        .text(`Encuestados: ${kpi.totales.encuestados.toLocaleString('es-PE')}`, marginX, y, { continued: true })
        .font('Helvetica').fillColor(MUTED).text(`   |   `, { continued: true })
        .font('Helvetica-Bold').fillColor(INK).text(`Empleados: ${kpi.totales.empleados.toLocaleString('es-PE')}`);
      y += 26;

      // ---- Indicadores (tarjetas en grilla) ----
      doc.fontSize(13).font('Helvetica-Bold').fillColor(FOREST).text('Indicadores', marginX, y);
      y += 20;

      const cols = 2;
      const gap = 12;
      const cardW = (contentW - gap * (cols - 1)) / cols;
      const cardH = 42;
      kpi.kpis.forEach((k: any, i: number) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = marginX + col * (cardW + gap);
        const cy = y + row * (cardH + gap);
        doc.rect(cx, cy, cardW, cardH).fill(FOREST_LIGHT);
        doc.rect(cx, cy, 3, cardH).fill(BRAND);
        doc.fontSize(8).font('Helvetica').fillColor(MUTED)
          .text(k.titulo.toUpperCase(), cx + 12, cy + 8, { width: cardW - 20 });
        doc.fontSize(15).font('Helvetica-Bold').fillColor(FOREST)
          .text(`${(k.valor * 100).toFixed(1)}%` + (k.detalle ? `  ·  ${k.detalle}` : ''), cx + 12, cy + 20, { width: cardW - 20 });
      });
      const rows = Math.ceil(kpi.kpis.length / cols);
      y += rows * (cardH + gap) + 8;

      // ---- Evolución de tasa de empleo por año ----
      if (porAnio.length > 1) {
        doc.fontSize(13).font('Helvetica-Bold').fillColor(FOREST).text('Tasa de empleo por año de egreso', marginX, y);
        y += 20;
        y = this.dibujarLinea(doc, porAnio, marginX, y, contentW, 90);
        y += 16;
      }

      // ---- Distribuciones (rubro / cargo) en dos columnas con gráfico de barras ----
      if (y > doc.page.height - 220) { doc.addPage(); y = 48; }
      doc.fontSize(13).font('Helvetica-Bold').fillColor(FOREST).text('Distribución por Rubro', marginX, y);
      doc.fontSize(13).font('Helvetica-Bold').fillColor(FOREST).text('Distribución por Cargo', marginX + contentW / 2 + 10, y);
      y += 20;
      const colW = (contentW - 20) / 2;
      const yFinR = this.dibujarBarras(doc, rubro, marginX, y, colW);
      const yFinC = this.dibujarBarras(doc, cargo, marginX + colW + 20, y, colW);
      y = Math.max(yFinR, yFinC) + 16;

      // ---- Pie de página ----
      doc.fontSize(8).fillColor(MUTED)
        .text('Plataforma CONECTA URP · Analítica de Egresados', marginX, doc.page.height - 36, { width: contentW, align: 'center' });

      doc.end();
    });
  }
}
