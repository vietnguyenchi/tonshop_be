import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Contract, TonClient, WalletContractV4, internal } from '@ton/ton';
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

   async createWallet(mnemonic: string, network: string, apiKey: string) {
      const key = await mnemonicToWalletKey(mnemonic.split(' '));
      const wallet = WalletContractV4.create({
         publicKey: key.publicKey,
         workchain: 0,
      });
      const client = new TonClient({
         endpoint: network,
         apiKey: apiKey,
      });
      return { wallet, client, key };
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

   async getAllTransaction() {
      return this.databaseService.transactionTon.findMany();
   }

   async getTransactionByCode(code: string) {
      return this.databaseService.transactionTon.findUnique({
         where: { code },
      });
   }
}
