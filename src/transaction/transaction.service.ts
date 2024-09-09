import { CreateTonTransactionDto } from './dto/create-tonTransaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { internal, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { getHttpEndpoint, Network } from '@orbs-network/ton-access';
import axios from 'axios';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { MomoCallbackDto } from './dto/momo-callback.dto';
import * as CryptoJS from 'crypto-js';
import { TransactionGateway } from './transaction.gateway';

@Injectable()
export class TransactionService {
  constructor(
    private readonly databaseService: DatabaseService,
    private transactionGateway: TransactionGateway,
  ) {}

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async transactionTon(
    createTonTransactionDto: CreateTonTransactionDto,
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

    const endpoint = await getHttpEndpoint({
      network: createTonTransactionDto.chain as Network,
    });
    const client = new TonClient({ endpoint });

    if (!(await client.isContractDeployed(wallet.address))) {
      throw new Error('Wallet not deployed');
    }

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    let currentSeqno = seqno;
    const maxAttempts = 10;
    let attempts = 0;

    while (currentSeqno === seqno && attempts < maxAttempts) {
      console.log(
        `Waiting for transaction to be sent... Attempt ${attempts + 1}`,
      );
      currentSeqno = await walletContract.getSeqno();
      await this.sleep(1000);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Transaction confirmation timeout');
    }

    // this.transactionGateway.notifyTransactionStatus({
    //   message: 'Transaction sent',
    //   status: 'success',
    //   transactionDetails: {
    //     walletAddress: createTonTransactionDto.walletAddress,
    //     quantity: createTonTransactionDto.quantity,
    //     chain: createTonTransactionDto.chain,
    //   },
    // });
    return { message: 'Transaction sent', status: 'success' };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    try {
      const amount = parseInt(
        Math.ceil(
          createTransactionDto.exchangeRate * createTransactionDto.quantity +
            createTransactionDto.transactionFee,
        ).toString(),
      );

      const signkey = 'asR4#Tas';
      const chargeType = createTransactionDto.chargeType;
      const requestId = createTransactionDto.requestId;

      const sign = CryptoJS.MD5(
        `${amount}${chargeType}${requestId}${signkey}`,
      ).toString();

      const response = await axios.get(
        `https://switch.mopay.info/api13/MM/RegCharge?apiKey=${process.env.API_KEY}&chargeType=${chargeType}&amount=${amount}&requestId=${requestId}&callback=https://tonshop-be.onrender.com/transaction/momo_callback&redirectFrontEnd_url=https://ton-shop.onrender.com/transactionStatus&sign=${sign}`,
      );

      const data: Prisma.transactionCreateInput = {
        chargeId: response.data.data.id.toString(),
        chargeType: response.data.data.chargeType,
        code: response.data.data.code,
        amount: amount,
        redirect_ssl: response.data.data.redirect_ssl,
        quantity: createTransactionDto.quantity,
        chain: createTransactionDto.chain,
        walletAddress: createTransactionDto.walletAddress,
        user: { connect: { telegramId: createTransactionDto.userId } },
        transactionFee: createTransactionDto.transactionFee,
        exchangeRate: createTransactionDto.exchangeRate,
        requestId: createTransactionDto.requestId,
        status: 'waiting', // Add initial status
      };

      return this.databaseService.transaction.create({
        data,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Error while creating transaction',
        },
        500,
      );
    }
  }

  async findWaitingTransactions(userId: string) {
    return this.databaseService.transaction.findMany({
      where: {
        status: 'waiting',
        userId,
      },
    });
  }

  async updateTransactionStatus(
    chargeId: string,
    data: Prisma.transactionUpdateInput,
  ) {
    return this.databaseService.transaction.update({
      where: { chargeId },
      data,
    });
  }

  async findTransactionByChargeId(chargeId: string) {
    const transaction = await this.databaseService.transaction.findUnique({
      where: { chargeId },
    });

    if (!transaction) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Transaction not found',
        },
        404,
      );
    }

    if (transaction.status === 'waiting') {
      const status = await this.checkTransactionStatus(chargeId);
      if (status.status !== 'Waiting') {
        const updatedTransaction = await this.updateTransactionStatus(
          chargeId,
          { status: status.status },
        );
        return updatedTransaction;
      }
    }

    return transaction;
  }

  async findAllTransactions(userId: string) {
    return this.databaseService.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async checkTransactionStatus(chargeId: string) {
    try {
      const response = await axios.get(
        `https://switch.mopay.info/api13/MM/CheckCharge?apiKey=${process.env.API_KEY}&id=${chargeId}`,
      );

      return response.data.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: 'error',
          message: error.response.data.message,
        },
        500,
      );
    }
  }

  async createMomoCallback(momoCallbackDto: MomoCallbackDto) {
    if (momoCallbackDto.status !== 'success') {
      return;
    }

    await this.databaseService.momoCallback.create({
      data: {
        chargeId: momoCallbackDto.chargeId,
        status: momoCallbackDto.status,
        chargeAmount: momoCallbackDto.chargeAmount,
        regAmount: momoCallbackDto.regAmount,
      },
    });

    const chargeAmount = Number(momoCallbackDto.chargeAmount);
    const regAmount = Number(momoCallbackDto.regAmount);

    await this.updateTransactionStatus(momoCallbackDto.chargeId, {
      status: 'success',
    });

    if (chargeAmount >= regAmount) {
      const transaction = await this.databaseService.transaction.findUnique({
        where: { chargeId: momoCallbackDto.chargeId },
      });

      if (transaction) {
        try {
          const result = await this.transactionTon({
            walletAddress: transaction.walletAddress,
            quantity: transaction.quantity,
            chain: transaction.chain,
            message: transaction.code,
          });

          if (result.status === 'success') {
            await this.updateTransactionStatus(momoCallbackDto.chargeId, {
              status: 'success',
            });
            this.transactionGateway.notifyTransactionStatus({
              message: 'Transfer TON successfully',
              status: 'success',
              transactionDetails: {
                walletAddress: transaction.walletAddress,
                quantity: transaction.quantity,
                chain: transaction.chain,
                transaction: transaction,
              },
            });
          }
        } catch (error) {
          console.error(error);
          this.transactionGateway.notifyTransactionStatus({
            message: 'Error in TON transfer',
            status: 'error',
            transactionDetails: {
              walletAddress: transaction.walletAddress,
              quantity: transaction.quantity,
              chain: transaction.chain,
              transaction: transaction,
            },
          });
        }
      }
    } else {
      await this.updateTransactionStatus(momoCallbackDto.chargeId, {
        status: 'success',
      });
      this.transactionGateway.notifyTransactionStatus({
        message:
          'You have been charged less than the amount required, please try again',
        status: 'error',
      });
    }
  }
}
