import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validates every DTO (like binding:"required" tags in Gin) and strips unknown fields.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`auth-service listening on :${port}`);
}
bootstrap();
