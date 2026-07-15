import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';

// Mapa header crudo -> campo analítico (idéntico al ETL de Python)
const COL: Record<string, string> = {
  Encuesta: 'campania',
  'AñoEgresoOficial': 'anioEgreso',
  'AñoTitulación': 'anioTitulacion',
  'Facultad/Escuela': 'escuela',
  'Gradoacadémico': 'grado',
  '¿Actualmenteseencuentratrabajando?': 'trabajando',
  Tipo_Empleo_Estandarizado: 'tipoEmpleo',
  'Tipodeempresaenlaquetrabaja:': 'tipoEmpresa',
  RUBRO: 'rubro',
  Cargo_Estandarizado: 'cargoNivel',
  '¿Quécargodesempeña?': 'cargoTexto',
  '¿SupuestoactualestárelacionadoconlacarreraqueestudióenURP?': 'correspondencia',
  '¿Estásatisfecho(a)consudesarrollolaboral?': 'satisfaccion',
  '¿Cuántotiempotardóenencontrarsuprimerempleodespuésdeegresar?': 'tiempoEmpleo',
  '¿CómocalificalacalidaddelaformaciónrecibidaenlaURP?': 'calidadFormacion',
  'PaísyCiudadderesidenciaactual2': 'ubicacion',
};

const CORRESPONDENCIA: Record<string, string> = {
  Totalmente: 'TOTALMENTE', Mucho: 'MUCHO', Poco: 'POCO', Nada: 'NADA',
};
const TIEMPO: Record<string, string> = {
  'Menos de 3 meses': 'MENOS_3M', 'Entre 3 meses y 6 meses': 'ENTRE_3_6M',
  'Entre 6 meses y 1 año': 'ENTRE_6_12M', 'Entre 1 año y 2 años': 'ENTRE_1_2A',
  'Más de 2 años': 'MAS_2A',
};
const TIPO_EMPLEO: Record<string, string> = { Privada: 'PRIVADA', 'Pública': 'PUBLICA' };

const clean = (v: any): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s && s.toLowerCase() !== 'nan' ? s : null;
};
const toInt = (v: any): number | null => {
  const s = clean(v);
  if (s === null) return null;
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
};
// Año plausible: entre 1961 (fundación URP) y el año de la campaña.
const anioValido = (v: any, tope = 2025): number | null => {
  const n = toInt(v);
  return n !== null && n >= 1961 && n <= tope ? n : null;
};

function facultadDe(escuela: string): string {
  const e = escuela.toLowerCase();
  if (e.startsWith('ccee')) return 'Ciencias Económicas y Empresariales';
  if (e.includes('ingenier')) return 'Ingeniería';
  if (e.includes('arquitectura')) return 'Arquitectura y Urbanismo';
  if (e.includes('psicolog')) return 'Psicología';
  if (e.includes('derecho')) return 'Derecho y Ciencia Política';
  if (e.includes('medicina')) return 'Medicina Humana';
  if (e.includes('biológic') || e.includes('biologic') || e.includes('veterinaria'))
    return 'Ciencias Biológicas';
  if (e.includes('lenguas') || e.includes('traducción')) return 'Humanidades y Lenguas Modernas';
  return 'Otras';
}

type Resultado = {
  dryRun: boolean;
  campaniaAnio: number;
  totales: { filas: number; validas: number };
  dimensiones: { escuelas: number; rubros: number; niveles: number };
  advertencias: string[];
  insertadas?: number;
};

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Procesa un buffer de Excel. Con `dryRun=true` solo valida y reporta;
   * con `dryRun=false` carga (reemplaza) la campaña correspondiente.
   */
  async procesar(buffer: Buffer, dryRun = false, hoja = 'Form_Responses3'): Promise<Resultado> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    if (!wb.SheetNames.includes(hoja))
      throw new BadRequestException(`No se encontró la hoja "${hoja}". Hojas: ${wb.SheetNames.join(', ')}`);

    const raw: any[] = XLSX.utils.sheet_to_json(wb.Sheets[hoja], { defval: null });
    if (raw.length === 0) throw new BadRequestException('La hoja está vacía');

    const advertencias: string[] = [];
    const faltantes = Object.keys(COL).filter((h) => !(h in raw[0]));
    if (faltantes.length > 5)
      throw new BadRequestException(`El archivo no tiene la estructura esperada. Faltan columnas: ${faltantes.slice(0, 5).join(', ')}…`);
    faltantes.forEach((h) => advertencias.push(`Columna ausente (se ignora): ${h}`));

    // Normalización
    const escuelas = new Map<string, number>();
    const rubros = new Map<string, number>();
    const niveles = new Map<string, number>();
    const reg = (m: Map<string, number>, n: string | null) => {
      if (!n) return null;
      if (!m.has(n)) m.set(n, m.size + 1);
      return m.get(n)!;
    };

    const registros = raw.map((row) => {
      const g = (raw: string) => row[raw];
      const escuela = clean(g('Facultad/Escuela'));
      const trabajando = clean(g('¿Actualmenteseencuentratrabajando?')) === 'Sí';
      const tieneNegocio = clean(g('¿Cuentaconunnegociopropio?')) === 'Sí';
      const te = clean(g('Tipo_Empleo_Estandarizado')) || clean(g('Tipodeempresaenlaquetrabaja:'));
      const temp = clean(g('Tipodeempresaenlaquetrabaja:'));
      return {
        campaniaAnio: toInt(g('Encuesta')) ?? 2025,
        anioEgreso: anioValido(g('AñoEgresoOficial')),
        anioTitulacion: anioValido(g('AñoTitulación')),
        escuelaId: reg(escuelas, escuela),
        grado: clean(g('Gradoacadémico')),
        trabajando,
        tieneNegocio,
        tipoEmpleo: te ? TIPO_EMPLEO[te] ?? null : null,
        tipoEmpresa: temp ? TIPO_EMPLEO[temp] ?? null : null,
        rubroId: trabajando ? reg(rubros, clean(g('RUBRO'))) : null,
        nivelCargoId: trabajando ? reg(niveles, clean(g('Cargo_Estandarizado'))) : null,
        cargoTexto: clean(g('¿Quécargodesempeña?')),
        correspondencia: (() => { const c = clean(g('¿SupuestoactualestárelacionadoconlacarreraqueestudióenURP?')); return c ? CORRESPONDENCIA[c] ?? null : null; })(),
        satisfaccion: toInt(g('¿Estásatisfecho(a)consudesarrollolaboral?')),
        tiempoPrimerEmpleo: (() => { const t = clean(g('¿Cuántotiempotardóenencontrarsuprimerempleodespuésdeegresar?')); return t ? TIEMPO[t] ?? null : null; })(),
        calidadFormacion: toInt(g('¿CómocalificalacalidaddelaformaciónrecibidaenlaURP?')),
        ubicacion: clean(g('PaísyCiudadderesidenciaactual2')),
      };
    });

    const anio = registros[0].campaniaAnio;
    const resultado: Resultado = {
      dryRun,
      campaniaAnio: anio,
      totales: { filas: raw.length, validas: registros.filter((r) => r.escuelaId).length },
      dimensiones: { escuelas: escuelas.size, rubros: rubros.size, niveles: niveles.size },
      advertencias,
    };
    if (dryRun) return resultado;

    // Carga transaccional: reemplaza la campaña
    await this.prisma.$transaction(async (tx) => {
      const campania = await tx.campania.upsert({
        where: { anio }, update: { activa: true },
        create: { anio, nombre: `CONECTA URP ${anio}`, activa: true },
      });
      await tx.respuestaEncuesta.deleteMany({ where: { campaniaId: campania.id } });

      const escId = await this.upsertDim(tx.escuela, [...escuelas.keys()], (n) => ({ nombre: n, facultad: facultadDe(n) }));
      const rubId = await this.upsertDim(tx.rubro, [...rubros.keys()], (n) => ({ nombre: n }));
      const nivId = await this.upsertDim(tx.nivelCargo, [...niveles.keys()], (n) => ({ nombre: n }));
      const idx = (m: Map<string, number>, id: number | null) =>
        id ? [...m.entries()].find(([, v]) => v === id)?.[0] : null;

      const data = registros.map((r) => ({
        campaniaId: campania.id,
        escuelaId: r.escuelaId ? escId.get(idx(escuelas, r.escuelaId)!) ?? null : null,
        rubroId: r.rubroId ? rubId.get(idx(rubros, r.rubroId)!) ?? null : null,
        nivelCargoId: r.nivelCargoId ? nivId.get(idx(niveles, r.nivelCargoId)!) ?? null : null,
        anioEgreso: r.anioEgreso, anioTitulacion: r.anioTitulacion, grado: r.grado,
        trabajando: r.trabajando, tieneNegocio: r.tieneNegocio, tipoEmpleo: r.tipoEmpleo as any, tipoEmpresa: r.tipoEmpresa as any,
        cargoTexto: r.cargoTexto, correspondencia: r.correspondencia as any,
        satisfaccion: r.satisfaccion, tiempoPrimerEmpleo: r.tiempoPrimerEmpleo as any,
        calidadFormacion: r.calidadFormacion, ubicacion: r.ubicacion,
      }));
      await tx.respuestaEncuesta.createMany({ data });
      resultado.insertadas = data.length;
    });

    return resultado;
  }

  /** Inserta dimensiones que no existan y devuelve mapa nombre -> id real en BD. */
  private async upsertDim(model: any, nombres: string[], build: (n: string) => any) {
    const map = new Map<string, number>();
    for (const nombre of nombres) {
      const row = await model.upsert({ where: { nombre }, update: {}, create: build(nombre) });
      map.set(nombre, row.id);
    }
    return map;
  }
}
