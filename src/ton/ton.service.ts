import { Injectable, Logger } from '@nestjs/common';
import { TonRepository } from './ton.repository';
import { Address, Cell, fromNano, internal } from '@ton/core';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';

@Injectable()
export class TonService {
   private readonly logger = new Logger(TonService.name);

   constructor(private readonly tonRepository: TonRepository) {}

   async sleep(ms: number): Promise<void> {
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
         const result = await this.processTransaction(
            network.value.toLowerCase(),
            recipientAddress,
            quantity,
            message,
            network,
         );
         this.logger.log(`Transaction completed: ${JSON.stringify(result)}`);
         return result;
      } catch (error) {
         this.logger.error(`Transaction failed: ${error.message}`, error.stack);
         throw error;
      }
   }

   private async processTransaction(
      chain: string,
      recipientAddress: string,
      quantity: number,
      message: string,
      network: any,
   ) {
      switch (chain) {
         case 'ton':
            this.logger.log('Processing TON transaction');
            return await this.transactionTon(
               recipientAddress,
               quantity,
               message,
               network.rpcUrl,
               network.apiKey,
            );
         case 'ethereum':
            this.logger.log(`Processing ${network.value} transaction`);
            return await this.transferEVM(
               recipientAddress,
               quantity,
               network.rpcUrl,
            );
         default:
            this.logger.warn(`Unsupported chain: ${network.value}`);
            throw new Error('Unsupported chain');
      }
   }

   async transactionTon(
      walletAddress: string,
      quantity: number,
      message: string,
      network: string,
      apiKey: string,
   ) {
      const { privateKey: mnemonic } =
         await this.tonRepository.findActiveWallet();
      if (!mnemonic) {
         throw new Error('Wallet mnemonic not found');
      }

      const { wallet, client, key, http } =
         await this.tonRepository.createWallet(mnemonic, network, apiKey);

      const walletContract = client.open(wallet);
      const seqno = await walletContract.getSeqno();

      const state = await client.getContractState(walletContract.address);

      await this.tonRepository.createTonTransaction({
         address: walletAddress,
         lt_start: state.lastTransaction.lt,
         code: message,
      });

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
         sendMode: 1,
      });

      await this.sleep(20000);

      const transactions = await http.getTransactions(
         Address.parse(walletAddress),
         {
            limit: 10,
            lt: state.lastTransaction?.lt,
         },
      );

      for (const transaction of transactions) {
         if (transaction.in_msg?.message.includes(message)) {
            const data = await http.getTransaction(
               Address.parse(walletAddress),
               transaction.transaction_id.lt,
               transaction.transaction_id.hash,
            );

            await this.tonRepository.updateTonTransaction(message, {
               quantity: Number(fromNano(data.in_msg?.value)),
               lt: data.transaction_id.lt,
               hash: data.transaction_id.hash,
               status: 'success',
            });

            break;
         }
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

   async estimateGas(
      recipientAddress: string,
      quantity: number,
      chainId: string,
      message: string,
   ) {
      const network = await this.tonRepository.findChain(chainId);

      if (!network) {
         this.logger.error(`Network not found for chainId: ${chainId}`);
         throw new Error('Network not found');
      }

      const { privateKey: mnemonic } =
         await this.tonRepository.findActiveWallet();
      if (!mnemonic) {
         throw new Error('Wallet mnemonic not found');
      }

      const { wallet, client, key } = await this.tonRepository.createWallet(
         mnemonic,
         network.rpcUrl,
         network.apiKey,
      );

      const walletContract = client.open(wallet);

      const seqno = await walletContract.getSeqno();

      const sendTransfer = walletContract.createTransfer({
         secretKey: key.secretKey,
         seqno: seqno,
         messages: [
            internal({
               value: quantity.toString(),
               to: Address.parse(recipientAddress),
               body: message,
               bounce: false,
            }),
         ],
         sendMode: 1,
      });

      const estimate = await client.estimateExternalMessageFee(
         Address.parse(recipientAddress),
         {
            body: sendTransfer,
            initCode: walletContract.init.code,
            initData: walletContract.init.data,
            ignoreSignature: false,
         },
      );

      const estimateFee = fromNano(
         estimate.source_fees.fwd_fee +
            estimate.source_fees.gas_fee +
            estimate.source_fees.in_fwd_fee +
            estimate.source_fees.storage_fee,
      );

      return estimateFee;
   }

   async getAllTransactions(page: number, limit: number) {
      return this.tonRepository.getAllTransaction(page, limit);
   }
}
