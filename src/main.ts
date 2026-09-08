import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const isProduction =
    config.get<string>('NODE_ENV') === 'production' ||
    config.get<string>('VERCEL_ENV') === 'production';

  const configuredOrigins = (config.get<string>('CORS_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowedOrigins = [
    config.get<string>('FRONTEND_URL'),
    ...configuredOrigins,
  ].filter(Boolean) as string[];
  app.enableCors({
    origin: isProduction
      ? (
          origin: string | undefined,
          callback: (error: Error | null, allow?: boolean) => void,
        ) => {
          // Allow server-to-server requests (no origin header)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(
            new Error(`CORS: Origin "${origin}" tidak diizinkan`),
            false,
          );
        }
      : true, // development: allow semua origin (termasuk file://)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(config.get<number>('PORT') ?? 3000);
}
void bootstrap();
