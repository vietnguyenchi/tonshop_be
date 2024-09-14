import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller'; // Make sure this is imported
import { DatabaseModule } from '../database/database.module';
import { BotModule } from '../bot/bot.module';
import { TonModule } from '../ton/ton.module';

@Module({
   imports: [DatabaseModule, BotModule, TonModule],
   controllers: [TransactionController],
   providers: [TransactionService],
   exports: [TransactionService],
})
export class TransactionModule {}
