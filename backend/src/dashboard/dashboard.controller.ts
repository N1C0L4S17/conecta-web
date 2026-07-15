import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { DashboardService } from './dashboard.service';
import { FiltrosDto } from './dto/filtros.dto';

@UseGuards(JwtAuthGuard, RolesGuard) // cualquier rol autenticado puede consultar
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('kpis')
  kpis(@Query() f: FiltrosDto) { return this.service.kpis(f); }

  @Get('rubro')
  rubro(@Query() f: FiltrosDto) { return this.service.distribucionRubro(f); }

  @Get('cargo')
  cargo(@Query() f: FiltrosDto) { return this.service.distribucionCargo(f); }

  @Get('empleo-por-anio')
  empleoPorAnio(@Query() f: FiltrosDto) { return this.service.empleoPorAnio(f); }

  @Get('filtros')
  filtros() { return this.service.opcionesFiltros(); }
}
