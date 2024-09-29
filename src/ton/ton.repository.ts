import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HttpApi, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TonRepository {
   constructor(private readonly databaseService: DatabaseService) {}

   async findActiveWallet() {
      return this.databaseService.wallet.findFirst({
         where: { status: 'active' },
         select: { privateKey: true },
      });
   }

   async findChain(chainId: string) {
      return this.databaseService.chain.findUnique({
         where: { id: chainId },
         select: { name: true, value: true, rpcUrl: true, apiKey: true },
      });
   }

   async createWallet(network: string, apiKey: string) {
      const mnemonic = process.env.SECRET_KEY;
      const key = await mnemonicToWalletKey(mnemonic.split(' '));
      const wallet = WalletContractV4.create({
         publicKey: key.publicKey,
         workchain: 0,
      });
      const client = new TonClient({
         endpoint: network,
         apiKey: apiKey,
      });

      const http = new HttpApi(network);
      return { wallet, client, key, http };
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
      updateTransactionDto: Prisma.TransactionTonUpdateInput,
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
