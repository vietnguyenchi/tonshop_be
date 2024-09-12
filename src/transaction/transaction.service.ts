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
import { BotService } from 'src/bot/bot.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly botService: BotService,
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

    const chain = await this.databaseService.chain.findUnique({
      where: {
        id: createTonTransactionDto.chain,
      },
    });

    const endpoint = await getHttpEndpoint({
      network: chain.value as Network,
    });
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
          to: createTonTransactionDto.walletAddress,
          value: createTonTransactionDto.quantity.toString(),
          body: createTonTransactionDto.message,
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

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    try {
      const amount = parseInt(
        Math.ceil(
          createTransactionDto.exchangeRate * createTransactionDto.quantity +
            createTransactionDto.transactionFee,
        ).toString(),
      );
      const signkey = process.env.SIGN_KEY;
      const chargeType = createTransactionDto.chargeType;
      const requestId = createTransactionDto.requestId;
      const sign = CryptoJS.MD5(
        `${amount}${chargeType}${requestId}${signkey}`,
      ).toString();
      const response = await axios.get(
        `https://switch.mopay.info/api13/MM/RegCharge?apiKey=${process.env.API_KEY}&chargeType=${chargeType}&amount=${amount}&requestId=${requestId}&callback=https://tonshop-be.onrender.com/transaction/momo_callback&redirectFrontEnd_url=https://ton-shop.onrender.com/transactionStatus&sign=${sign}`,
      );
      const data: Prisma.TransactionCreateInput = {
        chargeId: response.data.data.id.toString(),
        bank_provider: response.data.data.chargeType,
        amount: amount,
        quantity: createTransactionDto.quantity,
        chain: createTransactionDto.chain,
        walletAddress: createTransactionDto.walletAddress,
        user: { connect: { id: createTransactionDto.userId } },
        transactionFee: parseFloat(
          createTransactionDto.transactionFee.toString(),
        ),
        exchangeRate: createTransactionDto.exchangeRate,
        code: response.data.data.code,
        email: createTransactionDto.email,
        phoneName: response.data.data.phoneName,
        phoneNumber: createTransactionDto.phoneNumberUser,
        timeToExpired: response.data.data.timeToExpired,
        phoneNum: response.data.data.phoneNum,
        qr_url: response.data.data.qr_url,
        redirect_ssl: response.data.data.redirect_ssl,
        telegramId: createTransactionDto.telegramId,
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

  async updateTransactionStatus(
    chargeId: string,
    data: Prisma.TransactionUpdateInput,
  ) {
    return this.databaseService.transaction.update({
      where: { chargeId: chargeId },
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
      if (status.status !== 'waiting') {
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
      orderBy: { createAt: 'desc' },
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

  async sendTelegramMessage(telegramId: string, message: string) {
    try {
      await this.botService.sendMessage(telegramId, message);
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }

  async handleMomoCallback(momoCallbackDto: MomoCallbackDto) {
    if (momoCallbackDto.status !== 'success') {
      return;
    }

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
          await this.transactionTon({
            walletAddress: transaction.walletAddress,
            quantity: transaction.quantity,
            chain: transaction.chain,
            message: transaction.code,
          });

          const updatedTransaction = await this.updateTransactionStatus(
            momoCallbackDto.chargeId,
            {
              status: 'success',
            },
          );

          if (transaction.telegramId) {
            const message = `Transaction success
            Code: ${transaction.code}
            Please save this code for future reference.
            `;
            await this.sendTelegramMessage(transaction.telegramId, message);
          }

          return updatedTransaction;
        } catch (error) {
          console.error(error);
          if (transaction.telegramId) {
            const errorMessage =
              'There was an error processing your transaction. Please contact support.';
            await this.sendTelegramMessage(
              transaction.telegramId,
              errorMessage,
            );
          }
        }
      }
    } else {
      const transaction = await this.databaseService.transaction.findUnique({
        where: { chargeId: momoCallbackDto.chargeId },
      });

      if (transaction) {
        await this.updateTransactionStatus(momoCallbackDto.chargeId, {
          status: 'success',
        });

        // Send Telegram message about insufficient payment
        if (transaction.telegramId) {
          const message = `Your payment of ${chargeAmount} was received, but it's less than the required amount of ${regAmount}. Please contact support for assistance.`;
          await this.sendTelegramMessage(transaction.telegramId, message);
        }

        return null;
      }
    }
  }
}
