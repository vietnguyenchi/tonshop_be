import { Injectable, Logger } from '@nestjs/common';
import { TonRepository } from './ton.repository';
import { Address, Cell, internal } from '@ton/core';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';

@Injectable()
export class TonService {
   private readonly logger = new Logger(TonService.name);

   constructor(private readonly tonRepository: TonRepository) {}

   async sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
   }

   decodeBodyCell(bodyCell: Cell | undefined): string | null {
      try {
         if (!bodyCell) {
            console.error('bodyCell is undefined');
            return null;
         }

         // Chuyển đổi cell thành chuỗi hex
         const slice = bodyCell.toString();

         // Loại bỏ các ký tự không phải hex
         const cleanHex = slice.replace(/[^0-9A-Fa-f]/g, '');

         // Tạo mảng byte từ chuỗi hex
         const bytes = new Uint8Array(cleanHex.length / 2);
         for (let i = 0; i < cleanHex.length; i += 2) {
            bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
         }

         // Loại bỏ các byte null (nếu cần)
         const filteredBytes = bytes.filter((byte) => byte !== 0);

         // Giải mã toàn bộ mảng byte
         const decodedText = new TextDecoder().decode(filteredBytes);

         return decodedText;
      } catch (error) {
         console.error('Error decoding transaction body:', error);
         return null;
      }
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

            case 'ethereum':
               this.logger.log(`Processing ${network.value} transaction`);
               result = await this.transferEVM(
                  recipientAddress,
                  quantity,
                  network.rpcUrl,
               );
               break;
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
   ) {
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

      const transactions = await client.getTransactions(
         Address.parse(walletAddress),
         {
            limit: 10,
            lt: state.lastTransaction?.lt,
         },
      );

      for (const transaction of transactions) {
         if (this.decodeBodyCell(transaction.inMessage?.body) === message) {
            const data = await client.getTransaction(
               Address.parse(walletAddress),
               transaction.lt.toString(),
               transaction.hash().toString('base64'),
            );

            await this.tonRepository.updateTonTransaction(message, {
               lt: data.lt.toString(),
               hash: data.hash().toString('base64'),
            });

            break;
         }
      }
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
      chain: string,
      tokenAddress: string,
   ): Promise<{ message: string; status: string }> {
      const mnemonic = process.env.WALLET_MNEMONIC;
      if (!mnemonic) {
         throw new Error('Wallet mnemonic not found in environment variables');
      }

      const chainData = await this.tonRepository.findChain(chain);

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
