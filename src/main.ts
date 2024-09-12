import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Bot } from 'grammy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);

  const bot = new Bot(process.env.BOT_TOKEN);
  bot.start();
}
bootstrap();
