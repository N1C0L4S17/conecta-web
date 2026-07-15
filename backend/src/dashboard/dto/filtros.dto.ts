import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Correspondencia, TiempoEmpleo, TipoEmpleo } from '@prisma/client';

// "2020,2021" | ["2020","2021"] | 2020  ->  number[]
const toIntArray = ({ value }: any): number[] | undefined => {
  if (value === undefined || value === '' || value === null) return undefined;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  return arr.map((v) => parseInt(String(v).trim(), 10)).filter((n) => !Number.isNaN(n));
};

// "PRIVADA,PUBLICA" | ["PRIVADA"] | "PRIVADA"  ->  string[]
const toStrArray = ({ value }: any): string[] | undefined => {
  if (value === undefined || value === '' || value === null) return undefined;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  return arr.map((v) => String(v).trim()).filter(Boolean);
};

const toInt = ({ value }: any) =>
  value === undefined || value === '' ? undefined : parseInt(value, 10);

/**
 * Filtros del dashboard. Los campos multivalor aceptan varios valores
 * separados por coma (?anioEgreso=2020,2021,2022) y se aplican con `IN`.
 */
export class FiltrosDto {
  @IsOptional() @Transform(toInt) @IsInt() campaniaAnio?: number;

  @IsOptional() @Transform(toIntArray) @IsArray() @IsInt({ each: true }) anioEgreso?: number[];
  @IsOptional() @Transform(toIntArray) @IsArray() @IsInt({ each: true }) escuelaId?: number[];
  @IsOptional() @Transform(toIntArray) @IsArray() @IsInt({ each: true }) rubroId?: number[];
  @IsOptional() @Transform(toIntArray) @IsArray() @IsInt({ each: true }) nivelCargoId?: number[];

  @IsOptional() @Transform(toStrArray) @IsArray() @IsString({ each: true }) facultad?: string[];
  @IsOptional() @Transform(toStrArray) @IsArray() @IsString({ each: true }) tipoEmpleo?: TipoEmpleo[];
  @IsOptional() @Transform(toStrArray) @IsArray() @IsString({ each: true }) correspondencia?: Correspondencia[];
  @IsOptional() @Transform(toStrArray) @IsArray() @IsString({ each: true }) tiempoPrimerEmpleo?: TiempoEmpleo[];

  @IsOptional() @Transform(toInt) @IsInt() satisfaccionMin?: number;
}
