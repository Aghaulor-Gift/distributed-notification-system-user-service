import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('User Service API')
    .setDescription(
      'Manages user data, preferences, and authentication for the Distributed Notification System.',
    )
    .setVersion('1.0')
    .addTag('Users')
    .addTag('Preferences')
    .addTag('Health')
    .addServer('http://localhost:3001', 'Local Environment')
    .addServer('https://your-deployment-domain.com', 'Production Environment')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Start the server
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`${process.env.SERVICE_NAME} running on port ${port}`);
  console.log(`Swagger Docs: http://localhost:${port}/docs`);
}
bootstrap();
