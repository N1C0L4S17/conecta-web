import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

//Función Bootstrap.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet: deshabilitar CORP para permitir fetch cross-origin
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.setGlobalPrefix('api');

  // Auth por Bearer token (no cookies) → seguro permitir cualquier origin.
  const corsOrigin = process.env.CORS_ORIGIN?.trim();
  app.enableCors({
    origin: !corsOrigin || corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: false,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

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

  const corsOrigin = process.env.CORS_ORIGIN?.trim();
  app.enableCors({
    origin: !corsOrigin || corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: false,
  });
}
bootstrap();
