import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FiltrosDto } from './dto/filtros.dto';
import { buildWhere } from '../common/where.util';

/**
 * Toda la lógica de negocio del dashboard CONECTA.
 * Las fórmulas replican 1:1 las medidas DAX del PBIX original
 * (validadas numéricamente contra los datos reales 2025).
 */
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private pct(n: number, d: number): number {
    return d > 0 ? +(n / d).toFixed(4) : 0;
  }

  /** Los 7 KPIs del dashboard, respetando los filtros activos. */
  async kpis(f: FiltrosDto) {
    const base = buildWhere(f);
    const empleado: Prisma.RespuestaEncuestaWhereInput = { ...base, trabajando: true };

    const [
      total,
      empleados,
      privadaSector,
      adecuados,
      satAgg,
      menos6,
      menos12,
      conTiempo,
      emprendedores,
    ] = await this.prisma.$transaction([
      this.prisma.respuestaEncuesta.count({ where: base }),
      this.prisma.respuestaEncuesta.count({ where: empleado }),
      this.prisma.respuestaEncuesta.count({ where: { ...empleado, tipoEmpresa: 'PRIVADA' } }),
      this.prisma.respuestaEncuesta.count({
        where: { ...empleado, correspondencia: { in: ['TOTALMENTE', 'MUCHO'] } },
      }),
      this.prisma.respuestaEncuesta.aggregate({
        where: { ...empleado, satisfaccion: { not: null } },
        _avg: { satisfaccion: true },
      }),
      this.prisma.respuestaEncuesta.count({
        where: { ...empleado, tiempoPrimerEmpleo: { in: ['MENOS_3M', 'ENTRE_3_6M'] } },
      }),
      this.prisma.respuestaEncuesta.count({
        where: { ...empleado, tiempoPrimerEmpleo: { in: ['MENOS_3M', 'ENTRE_3_6M', 'ENTRE_6_12M'] } },
      }),
      this.prisma.respuestaEncuesta.count({
        where: { ...empleado, tiempoPrimerEmpleo: { not: null } },
      }),
      this.prisma.respuestaEncuesta.count({ where: { ...base, tieneNegocio: true } }),
    ]);

    const satProm = satAgg._avg.satisfaccion ?? 0;

    return {
      totales: { encuestados: total, empleados },
      kpis: [
        { clave: 'tasaEmpleo', titulo: 'Situación laboral actual', valor: this.pct(empleados, total), formato: 'pct' },
        { clave: 'tasaEmprendimiento', titulo: 'Tipo de empleo (Emprendimiento)', valor: this.pct(emprendedores, total), formato: 'pct', detalle: `${emprendedores} con negocio` },
        { clave: 'tasaAdecuacion', titulo: 'Adecuación profesional', valor: this.pct(adecuados, empleados), formato: 'pct' },
        { clave: 'tasaSectorPrivado', titulo: 'Sector de empleo', valor: this.pct(privadaSector, empleados), formato: 'pct' },
        { clave: 'indiceSatisfaccion', titulo: 'Nivel de satisfacción laboral', valor: Math.round(satProm), formato: 'indice' },
        { clave: 'tasaMenos12', titulo: 'Tiempo requerido para obtener el primer empleo < 12 meses', valor: this.pct(menos12, conTiempo), formato: 'pct' },
        { clave: 'tasaMenos6', titulo: 'Tiempo requerido para obtener el primer empleo < 6 meses', valor: this.pct(menos6, conTiempo), formato: 'pct' },
      ],
    };
  }

  /** Distribución % por RUBRO (barras horizontales). */
  async distribucionRubro(f: FiltrosDto) {
    const where: Prisma.RespuestaEncuestaWhereInput = {
      ...buildWhere(f), trabajando: true, rubroId: { not: null },
    };
    const grupos = await this.prisma.respuestaEncuesta.groupBy({
      by: ['rubroId'], where, _count: { _all: true },
    });
    const rubros = await this.prisma.rubro.findMany();
    const nombre = new Map(rubros.map((r) => [r.id, r.nombre]));
    const total = grupos.reduce((s, g) => s + g._count._all, 0);
    return grupos
      .map((g) => ({
        categoria: nombre.get(g.rubroId!) ?? '—',
        cantidad: g._count._all,
        porcentaje: this.pct(g._count._all, total),
      }))
      .sort((a, b) => b.porcentaje - a.porcentaje);
  }

  /** Distribución % por nivel de CARGO estandarizado (barras horizontales). */
  async distribucionCargo(f: FiltrosDto) {
    const where: Prisma.RespuestaEncuestaWhereInput = {
      ...buildWhere(f), trabajando: true, nivelCargoId: { not: null },
    };
    const grupos = await this.prisma.respuestaEncuesta.groupBy({
      by: ['nivelCargoId'], where, _count: { _all: true },
    });
    const niveles = await this.prisma.nivelCargo.findMany();
    const nombre = new Map(niveles.map((n) => [n.id, n.nombre]));
    const total = grupos.reduce((s, g) => s + g._count._all, 0);
    return grupos
      .map((g) => ({
        categoria: nombre.get(g.nivelCargoId!) ?? '—',
        cantidad: g._count._all,
        porcentaje: this.pct(g._count._all, total),
      }))
      .sort((a, b) => b.porcentaje - a.porcentaje);
  }

  /** Serie de tasa de empleo por año de egreso (para gráfico de líneas). */
  async empleoPorAnio(f: FiltrosDto) {
    // Importante: tipar los `where` explícitamente. Si se dejan inferir desde
    // un spread, Prisma pierde la validación de tipos y exige `orderBy`.
    const soloConAnio: Prisma.RespuestaEncuestaWhereInput = {
      ...buildWhere(f),
      anioEgreso: { not: null },
    };
    const conAnioYEmpleo: Prisma.RespuestaEncuestaWhereInput = {
      ...soloConAnio,
      trabajando: true,
    };

    const [total, empleados] = await Promise.all([
      this.prisma.respuestaEncuesta.groupBy({
        by: ['anioEgreso'],
        where: soloConAnio,
        orderBy: { anioEgreso: 'asc' },
        _count: true,
      }),
      this.prisma.respuestaEncuesta.groupBy({
        by: ['anioEgreso'],
        where: conAnioYEmpleo,
        orderBy: { anioEgreso: 'asc' },
        _count: true,
      }),
    ]);

    const empMap = new Map(empleados.map((e) => [e.anioEgreso, e._count]));
    return total.map((t) => {
      const emp = empMap.get(t.anioEgreso) ?? 0;
      return {
        anio: t.anioEgreso as number,
        total: t._count,
        empleados: emp,
        tasa: this.pct(emp, t._count),
      };
    });
  }
  
  /** Opciones disponibles para poblar los selectores de filtro. */
  async opcionesFiltros() {
    const [campanias, escuelas, rubros, niveles, anios] = await this.prisma.$transaction([
      this.prisma.campania.findMany({ orderBy: { anio: 'desc' } }),
      this.prisma.escuela.findMany({ orderBy: { nombre: 'asc' } }),
      this.prisma.rubro.findMany({ orderBy: { nombre: 'asc' } }),
      this.prisma.nivelCargo.findMany({ orderBy: { nombre: 'asc' } }),
      this.prisma.respuestaEncuesta.findMany({
        distinct: ['anioEgreso'], select: { anioEgreso: true },
        where: { anioEgreso: { not: null } }, orderBy: { anioEgreso: 'desc' },
      }),
    ]);
    const facultades = [...new Set(escuelas.map((e) => e.facultad))].sort();
    return {
      campanias, escuelas, rubros, niveles, facultades,
      aniosEgreso: anios.map((a) => a.anioEgreso).filter(Boolean),
      tiposEmpleo: ['PRIVADA', 'PUBLICA'],
      correspondencia: ['TOTALMENTE', 'MUCHO', 'POCO', 'NADA'],
      tiempos: ['MENOS_3M', 'ENTRE_3_6M', 'ENTRE_6_12M', 'ENTRE_1_2A', 'MAS_2A'],
    };
  }
}
