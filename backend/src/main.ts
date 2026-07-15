import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.setGlobalPrefix('api');
  // Auth por Bearer token (no cookies) → seguro permitir cualquier origen.
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*', credentials: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Documentación interactiva en /api/docs
  const config = new DocumentBuilder()
    .setTitle('API CONECTA URP')
    .setDescription('Analítica de la Encuesta de Egresados')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`API CONECTA en puerto ${port} · docs en /api/docs`);
}
bootstrap();
