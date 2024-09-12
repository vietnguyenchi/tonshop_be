import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { DatabaseModule } from '../database/database.module';
import { BotModule } from '../bot/bot.module'; // Adjust the import path as needed

@Module({
  imports: [
    DatabaseModule,
    BotModule, // Add this line to import BotModule
  ],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
