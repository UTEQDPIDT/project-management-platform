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
    .setTitle('UTEQ API Plataforma de Gestión de Proyectos')
    .setDescription(
      'Está documentación busca detallar los endpoints disponibles en la API de la Plataforma de Gestión de Proyectos.',
    )
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3001);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/docs`);
  console.log(`Swagger JSON available at: ${await app.getUrl()}/docs-json`);
}
bootstrap();
