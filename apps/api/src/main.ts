import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import { ForbiddenAuditFilter } from './common/filters/forbidden-audit.filter';

const REQUEST_ID_HEADER = 'x-request-id';

function resolveRequestId(headerValue?: string): string {
  const normalized = (headerValue ?? '').trim();
  const isValid = /^[A-Za-z0-9._:-]{8,128}$/.test(normalized);

  return isValid ? normalized : randomUUID();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = resolveRequestId(req.header(REQUEST_ID_HEADER));

    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  });

  app.useGlobalFilters(new ForbiddenAuditFilter());

  app.setGlobalPrefix('api', {
    exclude: ['docs', 'docs-json'],
  });

  /**
   * Cookie parser
   */
  app.use(cookieParser());

  /**
   * Helmet
   */
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
  } else {
    // Swagger uses inline scripts/styles
    app.use(helmet({ contentSecurityPolicy: false }));
  }

  /**
   * CORS configuration
   */
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://prep.uteq.edu.mx',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * API Swagger Documentation
   */
  const config = new DocumentBuilder()
    .setTitle('UTEQ API Plataforma de Gestión de Proyectos')
    .setDescription(
      'Está documentación busca detallar los endpoints disponibles en la API de la Plataforma de Gestión de Proyectos.',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('docs', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3001);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`Application is running on: ${await app.getUrl()}/api`);
    console.log(`Swagger UI available at: ${await app.getUrl()}/docs`);
    console.log(`Swagger JSON available at: ${await app.getUrl()}/docs-json`);
  }
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
