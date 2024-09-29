import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HttpApi, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { Prisma } from '@prisma/client';
import { UpdateTransactionTonDto } from './dto/update-transaction-ton.dto';

@Injectable()
export class TonRepository {
   constructor(private readonly databaseService: DatabaseService) {}

   async findAllChain() {
      return this.databaseService.chain.findMany();
   }

   async findChainById(id: string) {
      return this.databaseService.chain.findUnique({
         where: { id },
      });
   }

   async createTonTransaction(
      createTransactionDto: Prisma.TransactionTonCreateInput,
   ) {
      return this.databaseService.transactionTon.create({
         data: createTransactionDto,
      });
   }

   async updateTonTransaction(
      code: string,
      updateTransactionDto: UpdateTransactionTonDto,
   ) {
      return this.databaseService.transactionTon.update({
         where: { code },
         data: updateTransactionDto,
      });
   }

   async getAllTransaction(page: number, limit: number) {
      const skip = (page - 1) * limit;
      const [transactions, total] = await Promise.all([
         this.databaseService.transactionTon.findMany({
            orderBy: { lt: 'desc' },
            skip: skip,
            take: Number(limit),
         }),
         this.databaseService.transactionTon.count(),
      ]);

      return {
         data: transactions,
         meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
         },
      };
   }

   async getTransactionByCode(code: string) {
      return this.databaseService.transactionTon.findUnique({
         where: { code },
      });
   }
}
