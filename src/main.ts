import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
   const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
   });
   app.enableCors({
      origin: process.env.FRONTEND_URL,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Accept, Authorization',
   });
   await app.listen(3000);
}
bootstrap();
