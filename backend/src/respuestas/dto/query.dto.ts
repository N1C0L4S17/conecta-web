import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FiltrosDto } from '../../dashboard/dto/filtros.dto';

const toInt = ({ value }: any) =>
  value === undefined || value === '' ? undefined : parseInt(value, 10);

/** Filtros del dashboard + paginación/orden/búsqueda para el listado. */
export class QueryRespuestasDto extends FiltrosDto {
  @IsOptional() @Transform(toInt) @IsInt() @Min(1) page = 1;
  @IsOptional() @Transform(toInt) @IsInt() @Min(1) @Max(100) pageSize = 20;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(['anioEgreso', 'satisfaccion', 'createdAt']) sortBy = 'anioEgreso';
  @IsOptional() @IsIn(['asc', 'desc']) sortDir: 'asc' | 'desc' = 'desc';
}
