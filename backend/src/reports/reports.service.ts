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

  async pdf(f: FiltrosDto): Promise<Buffer> {
    const kpi = await this.dashboard.kpis(f);
    const [rubro, cargo] = await Promise.all([
      this.dashboard.distribucionRubro(f), this.dashboard.distribucionCargo(f),
    ]);
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 48, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fillColor('#0F6CBD').fontSize(20).text('CONECTA URP', { continued: true })
        .fillColor('#616161').fontSize(12).text('  · Reporte de Egresados');
      doc.moveDown(0.3).fillColor('#242424').fontSize(10)
        .text(`Encuestados: ${kpi.totales.encuestados}   |   Empleados: ${kpi.totales.empleados}`);
      doc.moveDown();

      doc.fontSize(13).fillColor('#0F6CBD').text('Indicadores');
      doc.moveDown(0.3).fillColor('#242424').fontSize(11);
      kpi.kpis.forEach((k: any) => {
        doc.text(`• ${k.titulo}: ${(k.valor * 100).toFixed(1)}%` + (k.detalle ? ` (${k.detalle})` : ''));
      });

      const bloque = (titulo: string, data: any[]) => {
        doc.moveDown().fontSize(13).fillColor('#0F6CBD').text(titulo);
        doc.moveDown(0.3).fillColor('#242424').fontSize(11);
        data.forEach((d) => doc.text(`• ${d.categoria}: ${(d.porcentaje * 100).toFixed(1)}% (${d.cantidad})`));
      };
      bloque('Distribución por Rubro', rubro);
      bloque('Distribución por Cargo', cargo);

      doc.moveDown().fontSize(8).fillColor('#999')
        .text(`Generado el ${new Date().toLocaleString('es-PE')} · Plataforma CONECTA URP`);
      doc.end();
    });
  }
}
