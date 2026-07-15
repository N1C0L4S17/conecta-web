import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { FiltrosDto } from '../dashboard/dto/filtros.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ANALISTA') // rol CONSULTA no exporta
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('csv')
  async csv(@Query() f: FiltrosDto, @Res() res: Response) {
    const data = await this.service.csv(f);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="conecta.csv"');
    res.send(data);
  }

  @Get('excel')
  async excel(@Query() f: FiltrosDto, @Res() res: Response) {
    const buf = await this.service.excel(f);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="conecta.xlsx"');
    res.send(buf);
  }

  @Get('pdf')
  async pdf(@Query() f: FiltrosDto, @Res() res: Response) {
    const buf = await this.service.pdf(f);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="conecta.pdf"');
    res.send(buf);
  }
}
