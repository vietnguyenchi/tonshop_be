import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from 'grammy';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Bot;
  constructor(private readonly transactionService: TransactionService) {
    this.bot = new Bot(process.env.BOT_TOKEN);
  }

  async onModuleInit() {
    this.bot.start();
  }

  async sendMessage(chatId: string, message: string) {
    try {
      await this.bot.api.sendMessage(chatId, message);
    } catch (error) {
      throw new Error('Failed to send message');
    }
  }
}
