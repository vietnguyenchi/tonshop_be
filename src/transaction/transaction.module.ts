import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionGateway } from './transaction.gateway';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [TransactionController],
  providers: [TransactionService, TransactionGateway, DatabaseService],
})
export class TransactionModule {}
