import {
  BadRequestException, Controller, ParseBoolPipe, Post, Query,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ImportService } from './import.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('import')
export class ImportController {
  constructor(private readonly service: ImportService) {}

  /**
   * POST /api/import/excel?dryRun=true|false
   * Campo multipart: "file" (.xlsx). dryRun=true solo valida.
   */
  @Post('excel')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 25 * 1024 * 1024 } }))
  async excel(
    @UploadedFile() file: Express.Multer.File,
    @Query('dryRun', new ParseBoolPipe({ optional: true })) dryRun = false,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    if (!/\.xlsx?$/.test(file.originalname))
      throw new BadRequestException('El archivo debe ser .xlsx');
    return this.service.procesar(file.buffer, dryRun);
  }
}
