import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { TonRepository } from './ton.repository';
import { Address, Cell, fromNano, internal, OpenedContract } from '@ton/core';
import { ethers, JsonRpcProvider, Wallet } from 'ethers';
import { HttpApi, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { BotService } from 'src/bot/bot.service';

@Injectable()
export class TonService implements OnModuleInit {
   private readonly logger = new Logger(TonService.name);
   private endpointMainnet: string = '';
   private endpointTestnet: string = '';
   private apiKeyMainnet: string = '';
   private apiKeyTestnet: string = '';
   private walletMainnet: WalletContractV4;
   private walletTestnet: WalletContractV4;
   private clientMainnet: TonClient;
   private clientTestnet: TonClient;
   private contractMainnet: OpenedContract<WalletContractV4>;
   private contractTestnet: OpenedContract<WalletContractV4>;
   private httpMainnet: HttpApi;
   private httpTestnet: HttpApi;
   private secretKey: Buffer = Buffer.from('');
   private publicKey: Buffer = Buffer.from('');

   constructor(private readonly tonRepository: TonRepository) {}

   async onModuleInit() {
      const networks = await this.tonRepository.findAllChain();

      networks.forEach((network) => {
         if (
            network.symbol.toLowerCase() === 'ton' &&
            network.network === 'mainnet'
         ) {
            this.endpointMainnet = network.rpcUrl;
            this.apiKeyMainnet = network.apiKey;
         } else if (
            network.symbol.toLowerCase() === 'ton' &&
            network.network === 'testnet'
         ) {
            this.endpointTestnet = network.rpcUrl;
            this.apiKeyTestnet = network.apiKey;
         }
      });

      const { secretKey, publicKey } = await mnemonicToWalletKey(
         process.env.SECRET_KEY.split(' '),
      );

      this.secretKey = secretKey;
      this.publicKey = publicKey;

      // Initialize clients and wallets
      await this.initializeClientsAndWallets();
   }

   private async initializeClientsAndWallets() {
      this.clientMainnet = new TonClient({
         endpoint: this.endpointMainnet,
         apiKey: this.apiKeyMainnet,
      });

      this.clientTestnet = new TonClient({
         endpoint: this.endpointTestnet,
         apiKey: this.apiKeyTestnet,
      });

      this.walletMainnet = WalletContractV4.create({
         publicKey: this.publicKey,
         workchain: 0,
      });

      this.walletTestnet = WalletContractV4.create({
         publicKey: this.publicKey,
         workchain: 0,
      });

      this.contractMainnet = this.clientMainnet.open(this.walletMainnet);
      this.contractTestnet = this.clientTestnet.open(this.walletTestnet);

      this.httpMainnet = new HttpApi(this.endpointMainnet);
      this.httpTestnet = new HttpApi(this.endpointTestnet);
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

      const network = await this.tonRepository.findChainById(chainId);

      if (!network) {
         this.logger.error(`Network not found for chainId: ${chainId}`);
         throw new Error('Network not found');
      }

      this.logger.debug(`Network found: ${network.symbol}`);

      try {
         const result = await this.processTransaction(
            network.symbol.toLowerCase(),
            recipientAddress,
            quantity,
            message,
            network.network,
         );
         this.logger.log(`Transaction completed: ${JSON.stringify(result)}`);
         return { message: 'Transaction sent', status: 'success' };
      } catch (error) {
         this.logger.error(`Transaction failed: ${error.message}`, error.stack);
         throw error;
      }
   }

   private async processTransaction(
      symbol: string,
      recipientAddress: string,
      quantity: number,
      message: string,
      network: any,
   ): Promise<{ message: string; status: string }> {
      switch (symbol) {
         case 'ton':
            this.logger.log('Processing TON transaction');
            return await this.transferTON(
               recipientAddress,
               quantity,
               message,
               network,
            );
         // case 'bsc':
         //    this.logger.log(`Processing ${network.symbol} transaction`);
         //    return await this.transferEVM(
         //       recipientAddress,
         //       quantity,
         //       network.rpcUrl,
         //    );
         // case 'ethereum':
         //    this.logger.log(`Processing ${network.symbol} transaction`);
         //    return await this.transferEVM(
         //       recipientAddress,
         //       quantity,
         //       network.rpcUrl,
         //    );
         default:
            this.logger.warn(`Unsupported chain: ${symbol}`);
            throw new Error('Unsupported chain');
      }
   }

   async sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
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

   //    const chainData = await this.tonRepository.findChainById(chain);

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
      const network = await this.tonRepository.findChainById(chainId);

      if (!network) {
         this.logger.error(`Network not found for chainId: ${chainId}`);
         throw new Error('Network not found');
      }

      let contract: OpenedContract<WalletContractV4>;
      let client: TonClient;
      let key: Buffer;

      if (network.network === 'mainnet') {
         contract = this.contractMainnet;
         client = this.clientMainnet;
         key = this.secretKey;
      } else {
         contract = this.contractTestnet;
         client = this.clientTestnet;
         key = this.secretKey;
      }

      const seqno = await contract.getSeqno();

      const sendTransfer = contract.createTransfer({
         secretKey: key,
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
            initCode: contract.init.code,
            initData: contract.init.data,
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

   async transferTON(
      recipientAddress: string,
      quantity: number,
      message: string,
      network: string,
   ) {
      await this.tonRepository.createTonTransaction({
         address: recipientAddress,
         quantity: quantity,
         code: message,
         status: 'waiting',
      });

      const { contract, http } = this.getNetworkResources(network);
      const seqno = await contract.getSeqno();

      await contract.sendTransfer({
         secretKey: this.secretKey,
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

      await this.sleep(20000);

      const transactions = await http.getTransactions(
         Address.parse(recipientAddress),
         {
            limit: 10,
            lt: (
               await http.getAddressInformation(Address.parse(recipientAddress))
            ).last_transaction_id.lt,
         },
      );

      let result = {
         message: 'Transaction failed',
         status: 'failed',
      };

      await Promise.all(
         transactions.map(async (transaction) => {
            if (transaction.in_msg.message.includes(message)) {
               await this.tonRepository.updateTonTransaction(message, {
                  lt: transaction.transaction_id.lt,
                  hash: transaction.transaction_id.hash,
                  quantity: Number(fromNano(transaction.in_msg.value)),
                  status: 'success',
               });
               result = {
                  message: 'Transaction sent',
                  status: 'success',
               };
            }
         }),
      );

      return result;
   }

   private getNetworkResources(network: string) {
      return network === 'mainnet'
         ? { contract: this.contractMainnet, http: this.httpMainnet }
         : { contract: this.contractTestnet, http: this.httpTestnet };
   }

   async getAllTransactions(page: number, limit: number) {
      return this.tonRepository.getAllTransaction(page, limit);
   }

   async getTransactionByCode(code: string) {
      return this.tonRepository.getTransactionByCode(code);
   }
}
