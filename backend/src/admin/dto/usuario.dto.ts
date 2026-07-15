import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Rol } from '@prisma/client';

export class CreateUsuarioDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(2) nombre!: string;
  @IsString() @MinLength(6) password!: string;
  @IsEnum(Rol) rol!: Rol;
}

export class UpdateUsuarioDto {
  @IsOptional() @IsString() @MinLength(2) nombre?: string;
  @IsOptional() @IsString() @MinLength(6) password?: string;
  @IsOptional() @IsEnum(Rol) rol?: Rol;
  @IsOptional() @IsBoolean() activo?: boolean;
}
