import { Module } from '@nestjs/common';
import { RespuestasService } from './respuestas.service';
import { RespuestasController } from './respuestas.controller';

@Module({ providers: [RespuestasService], controllers: [RespuestasController] })
export class RespuestasModule {}
