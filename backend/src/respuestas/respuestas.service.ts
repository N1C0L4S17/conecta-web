import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryRespuestasDto } from './dto/query.dto';
import { buildWhere } from '../common/where.util';

@Injectable()
export class RespuestasService {
  constructor(private prisma: PrismaService) {}

  async list(q: QueryRespuestasDto) {
    const where: Prisma.RespuestaEncuestaWhereInput = buildWhere(q);
    if (q.search) where.cargoTexto = { contains: q.search, mode: 'insensitive' };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.respuestaEncuesta.count({ where }),
      this.prisma.respuestaEncuesta.findMany({
        where,
        include: { escuela: true, rubro: true, nivelCargo: true, campania: true },
        orderBy: { [q.sortBy]: q.sortDir },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);

    return {
      data,
      meta: { total, page: q.page, pageSize: q.pageSize, totalPages: Math.ceil(total / q.pageSize) },
    };
  }

  findOne(id: number) {
    return this.prisma.respuestaEncuesta.findUnique({
      where: { id },
      include: { escuela: true, rubro: true, nivelCargo: true, campania: true },
    });
  }
}
