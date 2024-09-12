import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, DatabaseService],
})
export class TransactionModule {}
