import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5500', // Live Server / npx serve
    'http://127.0.0.1:5500', // Live Server (IP form)
    'https://ac-sejuk-abadi-frontend.vercel.app',
    'https://acsejukabadi.com/',
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: isProduction
      ? (origin, callback) => {
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
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
