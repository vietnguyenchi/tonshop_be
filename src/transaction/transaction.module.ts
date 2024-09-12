import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller'; // Make sure this is imported
import { DatabaseModule } from '../database/database.module';
import { BotModule } from '../bot/bot.module';

@Module({
  imports: [DatabaseModule, BotModule],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
