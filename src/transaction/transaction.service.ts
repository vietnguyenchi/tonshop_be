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

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async transactionTon(createTonTransactionDto: CreateTonTransactionDto) {
    const mnemonic =
      'toddler option spice motor hill mother shiver desert possible space dutch midnight cable eager category token uncle sell bus letter mercy seven census cluster';

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
      console.log('Wallet not deployed');
      return;
    }

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();

    await walletContract.sendTransfer({
      seqno: seqno,
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

    let currentSeqno = seqno;
    while (currentSeqno === seqno) {
      console.log('Waiting for the transaction to be confirmed...');
      await this.sleep(1500);
      currentSeqno = await walletContract.getSeqno();
    }

    return {
      message: 'Transaction confirmed',
      status: 'success',
    };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    try {
      const response = await axios.get(
        `http://easypay.vnm.bz:10007/api/MM/RegCharge?apiKey=56c1e562-8a16-43a7-922b-607f1a3cb764&chargeType=${createTransactionDto.chargeType}&amount=${createTransactionDto.amount}&requestId=test01&redirectFrontEnd_url=https://ton-shop.onrender.com/transactionStatus`,
      );

      const data = {
        chargeId: response.data.data.id.toString(),
        chargeType: response.data.data.chargeType,
        code: response.data.data.code,
        amount: response.data.data.amount,
        redirect_ssl: response.data.data.redirect_ssl,
        quantity: createTransactionDto.quantity,
        chain: createTransactionDto.chain,
        walletAddress: createTransactionDto.walletAddress,
      };

      return this.databaseService.transaction.create({
        data,
      });
    } catch (error) {
      throw new HttpException(
        {
          status: 'error',
          message: 'Error while creating transaction',
        },
        500,
      );
    }
  }

  async findWaitingTransactions() {
    return this.databaseService.transaction.findMany({
      where: {
        status: 'waiting',
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

  async findAllTransactions() {
    return this.databaseService.transaction.findMany();
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

    const response = await axios.get(
      `https://switch.mopay.info/api13/MM/CheckCharge?apiKey=56c1e562-8a16-43a7-922b-607f1a3cb764&id=${chargeId}`,
    );

    if (response.data.data.status !== 'waiting') {
      await this.updateTransactionStatus(chargeId, {
        status: response.data.data.status,
      });
    }

    return response.data.data;
  }
}
