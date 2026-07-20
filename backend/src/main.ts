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

  // Auth por Bearer token (no cookies) → seguro permitir orígenes explícitos + previews de Vercel
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) ?? [];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // requests sin origin (Postman, curl, etc.)

      const isAllowedExplicit = allowedOrigins.includes(origin);
      const isVercelPreview = /^https:\/\/conecta-[a-z0-9]+-mis-proyectos17\.vercel\.app$/.test(origin);

      if (isAllowedExplicit || isVercelPreview) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} no permitido por CORS`));
    },
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

