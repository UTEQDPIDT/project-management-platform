import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: ['docs', 'docs-json'],
  });

  /**
   * CORS configuration
   */
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  /**
   * API Swagger Documentation
   */
  const config = new DocumentBuilder()
    .setTitle('Documentation API Plataforma de Gestión de Proyectos')
    .setDescription(
      'Está documentación busca detallar los endpoints disponibles en la API de la Plataforma de Gestión de Proyectos.',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3001);

  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3001}/api`,
  );
  console.log(
    `Swagger UI available at: http://localhost:${process.env.PORT ?? 3001}/docs`,
  );
}
bootstrap();
