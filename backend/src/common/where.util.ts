import { Prisma } from '@prisma/client';
import { FiltrosDto } from '../dashboard/dto/filtros.dto';

/** Traduce los filtros (mono o multivalor) a un `where` de Prisma. */
export function buildWhere(f: FiltrosDto): Prisma.RespuestaEncuestaWhereInput {
  const w: Prisma.RespuestaEncuestaWhereInput = {};
  const inNum = (v?: number[]) => (v && v.length ? { in: v } : undefined);
  const inStr = (v?: string[]) => (v && v.length ? { in: v as any } : undefined);

  if (f.campaniaAnio) w.campania = { anio: f.campaniaAnio };
  if (f.anioEgreso?.length) w.anioEgreso = inNum(f.anioEgreso);
  if (f.escuelaId?.length) w.escuelaId = inNum(f.escuelaId);
  if (f.facultad?.length) w.escuela = { facultad: { in: f.facultad } };
  if (f.rubroId?.length) w.rubroId = inNum(f.rubroId);
  if (f.nivelCargoId?.length) w.nivelCargoId = inNum(f.nivelCargoId);
  if (f.tipoEmpleo?.length) w.tipoEmpleo = inStr(f.tipoEmpleo);
  if (f.correspondencia?.length) w.correspondencia = inStr(f.correspondencia);
  if (f.tiempoPrimerEmpleo?.length) w.tiempoPrimerEmpleo = inStr(f.tiempoPrimerEmpleo);
  if (f.satisfaccionMin) w.satisfaccion = { gte: f.satisfaccionMin };

  return w;
}
