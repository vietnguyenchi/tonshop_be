import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { getHttpEndpoint, Network } from '@orbs-network/ton-access';

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
         select: { name: true, value: true, rpcUrl: true },
      });
   }

   async createWallet(mnemonic: string, network: string) {
      const key = await mnemonicToWalletKey(mnemonic.split(' '));
      const wallet = WalletContractV4.create({
         publicKey: key.publicKey,
         workchain: 0,
      });
      const endpoint = await getHttpEndpoint({
         network: network.toLowerCase() as Network,
      });
      const client = new TonClient({ endpoint, timeout: 60000 });
      return { wallet, client, key };
   }

   async sendTonTransaction(walletContract, key, seqno, to, value, body) {
      return walletContract.sendTransfer({
         secretKey: key.secretKey,
         seqno: seqno,
         messages: [
            internal({
               to: to.toString(),
               value: value.toString(),
               body: body,
               bounce: false,
            }),
         ],
      });
   }
}
