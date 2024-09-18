import { Injectable, Logger } from '@nestjs/common';
import { TonRepository } from './ton.repository';
import { internal } from '@ton/core';
// import { ethers, JsonRpcProvider, Wallet } from 'ethers';

@Injectable()
export class TonService {
   private readonly logger = new Logger(TonService.name);

   constructor(private readonly tonRepository: TonRepository) {}

   private async sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
   }

   async sendTransaction(
      recipientAddress: string,
      quantity: number,
      chainId: string,
      message: string,
   ): Promise<{ message: string; status: string }> {
      this.logger.log(
         `Initiating transaction to ${recipientAddress} on chain ${chainId}`,
      );

      const network = await this.tonRepository.findChain(chainId);

      if (!network) {
         this.logger.error(`Network not found for chainId: ${chainId}`);
         throw new Error('Network not found');
      }

      this.logger.debug(`Network found: ${network.value}`);

      try {
         let result: any;
         switch (network.value.toLowerCase()) {
            case 'ton':
               this.logger.log('Processing TON transaction');
               result = await this.transactionTon(
                  recipientAddress,
                  quantity,
                  message,
                  network.rpcUrl,
                  network.apiKey,
               );
               break;
            // case 'bsc':
            // case 'ethereum':
            //    this.logger.log(`Processing ${network.value} transaction`);
            //    result = await this.transferEVM(recipientAddress, quantity, network.rpcUrl);
            //    break;
            default:
               this.logger.warn(`Unsupported chain: ${network.value}`);
               throw new Error('Unsupported chain');
         }

         this.logger.log(`Transaction completed: ${JSON.stringify(result)}`);
         return result;
      } catch (error) {
         this.logger.error(`Transaction failed: ${error.message}`, error.stack);
         throw error;
      }
   }

   async transactionTon(
      walletAddress: string,
      quantity: number,
      message: string,
      network: string,
      apiKey: string,
   ): Promise<{ message: string; status: string }> {
      const { privateKey: mnemonic } =
         await this.tonRepository.findActiveWallet();
      if (!mnemonic) {
         throw new Error('Wallet mnemonic not found');
      }

      const { wallet, client, key } = await this.tonRepository.createWallet(
         mnemonic,
         network,
         apiKey,
      );

      if (!(await client.isContractDeployed(wallet.address))) {
         throw new Error('Wallet not deployed');
      }

      const walletContract = client.open(wallet);
      const seqno = await walletContract.getSeqno();

      await walletContract.sendTransfer({
         secretKey: key.secretKey,
         seqno,
         messages: [
            internal({
               value: quantity.toString(),
               to: walletAddress,
               body: message,
               bounce: false,
            }),
         ],
      });

      return { message: 'Transaction sent', status: 'success' };
   }

   // private async transferEVM(
   //    recipientAddress: string,
   //    amount: number,
   //    rpcUrl: string,
   // ): Promise<{ message: string; status: string }> {
   //    const provider = new JsonRpcProvider(rpcUrl);
   //    const wallet = Wallet.fromPhrase(process.env.WALLET_MNEMONIC, provider);

   //    const tx = await wallet.sendTransaction({
   //       to: recipientAddress,
   //       value: ethers.parseEther(amount.toString()),
   //    });

   //    await tx.wait();

   //    return { message: 'Transaction sent', status: 'success' };
   // }

   // async transferERC20(
   //    recipientAddress: string,
   //    amount: number,
   //    chain: string,
   //    tokenAddress: string,
   // ): Promise<{ message: string; status: string }> {
   //    const mnemonic = process.env.WALLET_MNEMONIC;
   //    if (!mnemonic) {
   //       throw new Error('Wallet mnemonic not found in environment variables');
   //    }

   //    const chainData = await this.tonRepository.findChain(chain);

   //    const rpcUrl = chainData?.rpcUrl;
   //    const provider = new JsonRpcProvider(rpcUrl);
   //    const wallet = Wallet.fromPhrase(mnemonic, provider);

   //    const tokenContract = new ethers.Contract(
   //       tokenAddress,
   //       ['function transfer(address to, uint256 amount) returns (bool)'],
   //       wallet,
   //    );

   //    const tx = await tokenContract.transfer(
   //       recipientAddress,
   //       ethers.parseUnits(amount.toString(), 18),
   //    );
   //    await tx.wait();

   //    return { message: 'Transaction sent', status: 'success' };
   // }
}
