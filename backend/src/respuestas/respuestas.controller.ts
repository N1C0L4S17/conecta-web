import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RespuestasService } from './respuestas.service';
import { QueryRespuestasDto } from './dto/query.dto';

@UseGuards(JwtAuthGuard)
@Controller('respuestas')
export class RespuestasController {
  constructor(private readonly service: RespuestasService) {}

  @Get()
  list(@Query() q: QueryRespuestasDto) { return this.service.list(q); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
}
