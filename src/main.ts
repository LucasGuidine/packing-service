import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('packing-service');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Packing Service')
    .setDescription('API to decide packaging boxes')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'x-api-key')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('packing-service/api', app, document, {
    swaggerOptions: {
      url: '/packing-service/api-json',
    },
  });
  await app.listen(3000);
  console.log(
    'Listening on http://localhost:3000/packing-service - Swagger: http://localhost:3000/packing-service/api',
  );
}
bootstrap();
