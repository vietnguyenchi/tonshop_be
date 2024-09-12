import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class BotService implements OnModuleInit {
  private static instance: BotService;
  private bot: Bot;

  private constructor() {
    const token = process.env.BOT_TOKEN;
    if (!token) {
      throw new Error('BOT_TOKEN is not set in the environment variables');
    }
    this.bot = new Bot(token);
  }

  public static getInstance(): BotService {
    if (!BotService.instance) {
      BotService.instance = new BotService();
    }
    return BotService.instance;
  }

  async onModuleInit() {
    await this.bot.api.deleteWebhook();
    this.bot.start({
      onStart: () => console.log('Bot started'),
    });
  }

  async sendMessage(chatId: string, message: string) {
    try {
      await this.bot.api.sendMessage(chatId, message);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }
}
