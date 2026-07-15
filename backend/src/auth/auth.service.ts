import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!user || !user.activo) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    const token = await this.jwt.signAsync(
      { sub: user.id, rol: user.rol },
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '8h' },
    );
    return {
      accessToken: token,
      user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
    };
  }
}
