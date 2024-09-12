import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class BotService {
  private bot: Bot;
  private static instance: BotService;

  constructor(token: string) {
    this.bot = new Bot(token);
  }

  public static getInstance(token: string): BotService {
    if (!BotService.instance) {
      BotService.instance = new BotService(token);
    }
    return BotService.instance;
  }

  async onModuleInit() {
    // Clear the update queue
    this.bot.api.getUpdates({ offset: -1 }).then(() => {
      // Start your bot here
      this.bot.start();
    });
  }

  async sendMessage(chatId: string, message: string) {
    try {
      await this.bot.api.sendMessage(chatId, message);
    } catch (error) {
      throw new Error('Failed to send message');
    }
  }
}
