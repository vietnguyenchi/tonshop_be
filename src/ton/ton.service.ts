import { Injectable } from '@nestjs/common';
import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { getHttpEndpoint, Network } from '@orbs-network/ton-access';
import { DatabaseService } from '../database/database.service';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';

@Injectable()
export class TonService {
   constructor(private readonly databaseService: DatabaseService) {}

   private async sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
   }

   async sendTransaction(
      recipientAddress: string,
      amount: number,
      chainId: string,
      message: string = '',
   ): Promise<{ message: string; status: string }> {
      const network = await this.databaseService.chain.findUnique({
         where: { id: chainId },
      });

      if (!network) {
         throw new Error('Network not found');
      }

      switch (network.name.toLowerCase()) {
         case 'ton':
            return this.transactionTon(
               recipientAddress,
               amount,
               message,
               network.value,
            );
         case 'bsc':
            return this.transferEVM(recipientAddress, amount, network.rpcUrl);
         case 'ethereum':
            return this.transferEVM(recipientAddress, amount, network.rpcUrl);
         default:
            throw new Error('Unsupported chain');
      }
   }

   async transactionTon(
      walletAddress: string,
      quantity: number,
      message: string,
      network: string,
   ): Promise<{ message: string; status: string }> {
      const mnemonic = process.env.WALLET_MNEMONIC;
      if (!mnemonic) {
         throw new Error('Wallet mnemonic not found in environment variables');
      }

      const key = await mnemonicToWalletKey(mnemonic.split(' '));
      const wallet = WalletContractV4.create({
         publicKey: key.publicKey,
         workchain: 0,
      });

      // const network = process.env.TON_NETWORK || 'testnet';
      const endpoint = await getHttpEndpoint({ network: network as Network });
      const client = new TonClient({ endpoint });

      if (!(await client.isContractDeployed(wallet.address))) {
         throw new Error('Wallet not deployed');
      }

      const walletContract = client.open(wallet);
      const seqno = await walletContract.getSeqno();

      await walletContract.sendTransfer({
         secretKey: key.secretKey,
         seqno: seqno,
         messages: [
            internal({
               to: walletAddress,
               value: quantity.toString(),
               body: message,
               bounce: false,
            }),
         ],
      });

      let currentSeqno = seqno;
      while (currentSeqno === seqno) {
         console.log('Waiting for transaction to be confirmed...');
         await this.sleep(3000);
         currentSeqno = await walletContract.getSeqno();
      }

      return { message: 'Transaction sent', status: 'success' };
   }

   private async transferEVM(
      recipientAddress: string,
      amount: number,
      rpcUrl: string,
   ): Promise<{ message: string; status: string }> {
      const provider = new JsonRpcProvider(rpcUrl);
      const wallet = Wallet.fromPhrase(process.env.WALLET_MNEMONIC, provider);

      const tx = await wallet.sendTransaction({
         to: recipientAddress,
         value: ethers.parseEther(amount.toString()),
      });

      await tx.wait();

      return { message: 'Transaction sent', status: 'success' };
   }

   async transferERC20(
      recipientAddress: string,
      amount: number,
      chain: 'bsc' | 'ethereum',
      tokenAddress: string,
   ): Promise<{ message: string; status: string }> {
      const mnemonic = process.env.WALLET_MNEMONIC;
      if (!mnemonic) {
         throw new Error('Wallet mnemonic not found in environment variables');
      }

      const chainData = await this.databaseService.chain.findUnique({
         where: { id: chain },
         select: { rpcUrl: true },
      });

      const rpcUrl = chainData?.rpcUrl;
      const provider = new JsonRpcProvider(rpcUrl);
      const wallet = Wallet.fromPhrase(mnemonic, provider);

      const tokenContract = new ethers.Contract(
         tokenAddress,
         ['function transfer(address to, uint256 amount) returns (bool)'],
         wallet,
      );

      const tx = await tokenContract.transfer(
         recipientAddress,
         ethers.parseUnits(amount.toString(), 18),
      );
      await tx.wait();

      return { message: 'Transaction sent', status: 'success' };
   }
}
