import { CreateTonTransactionDto } from './dto/create-tonTransaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { internal, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { getHttpEndpoint, Network } from '@orbs-network/ton-access';
import axios from 'axios';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly databaseService: DatabaseService) {}

  private sleep(ms: number): Promise<void> {
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

    await walletContract.sendTransfer({
      seqno,
      secretKey: key.secretKey,
      messages: [
        internal({
          to: createTonTransactionDto.walletAddress,
          value: createTonTransactionDto.quantity.toString(),
          body: 'Transaction successful',
          bounce: false,
        }),
      ],
    });

    const result = await this.waitForTransactionConfirmation(
      walletContract,
      seqno,
      createTonTransactionDto,
    );

    return {
      message: result.success ? 'Transaction confirmed' : 'Transaction failed',
      status: result.success ? 'success' : 'failure',
    };
  }

  private async waitForTransactionConfirmation(
    walletContract: any,
    initialSeqno: number,
    createTonTransactionDto: CreateTonTransactionDto,
    maxAttempts = 10,
  ): Promise<{ success: boolean; transactionHash?: string }> {
    const client = walletContract.client;
    const address = await walletContract.getAddress();

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await this.sleep(1500);
      const currentSeqno = await walletContract.getSeqno();

      if (currentSeqno > initialSeqno) {
        // Fetch transactions since the initial seqno
        const transactions = await client.getTransactions(address, {
          limit: 20,
          fromLt: BigInt(0),
        });

        // Find the specific transaction we're looking for
        const targetTransaction = transactions.find(
          (tx: any) =>
            tx.inMessage?.value === createTonTransactionDto.quantity.toString(),
        );

        if (targetTransaction) {
          // Check if the transaction was successful
          if (targetTransaction.computePhase.success) {
            return { success: true, transactionHash: targetTransaction.hash };
          } else {
            return { success: false, transactionHash: targetTransaction.hash };
          }
        }
      }
    }

    // Timeout, consider as failure
    return { success: false };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    try {
      const amount = parseInt(
        Math.ceil(
          createTransactionDto.exchangeRate * createTransactionDto.quantity +
            createTransactionDto.transactionFee,
        ).toString(),
      );

      const response = await axios.get(
        `https://switch.mopay.info/api13/MM/RegCharge?apiKey=${process.env.API_KEY}&chargeType=${createTransactionDto.chargeType}&amount=${amount}&requestId=test01&redirectFrontEnd_url=https://ton-shop.onrender.com/transactionStatus/`,
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
      };

      return this.databaseService.transaction.create({
        data,
      });
    } catch (error) {
      console.log(error);
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
    return this.databaseService.transaction.findUnique({
      where: { chargeId },
    });
  }

  async findAllTransactions(userId: string) {
    return this.databaseService.transaction.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async checkTransactionStatus(chargeId: string) {
    const transaction = await this.findTransactionByChargeId(chargeId);

    if (!transaction) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Transaction not found',
        },
        404,
      );
    }

    try {
      const response = await axios.get(
        `https://switch.mopay.info/api13/MM/CheckCharge?apiKey=${process.env.API_KEY}&id=${chargeId}`,
      );

      return response.data;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Error while checking transaction status',
        },
        500,
      );
    }
  }
}
