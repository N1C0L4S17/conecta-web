import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/usuario.dto';

const SAFE = { id: true, email: true, nombre: true, rol: true, activo: true, createdAt: true };

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({ select: SAFE, orderBy: { createdAt: 'asc' } });
  }

  async create(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El correo ya está registrado');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.usuario.create({
      data: { email: dto.email, nombre: dto.nombre, rol: dto.rol, passwordHash },
      select: SAFE,
    });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.ensure(id);
    const data: any = { ...dto };
    if (dto.password) { data.passwordHash = await bcrypt.hash(dto.password, 10); delete data.password; }
    return this.prisma.usuario.update({ where: { id }, data, select: SAFE });
  }

  async remove(id: number) {
    await this.ensure(id);
    await this.prisma.usuario.delete({ where: { id } });
    return { ok: true };
  }

  private async ensure(id: number) {
    const u = await this.prisma.usuario.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
  }
}
