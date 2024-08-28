import { CreateBillDto } from './dto/create-bill.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { internal, TonClient, WalletContractV4 } from '@ton/ton';
import { mnemonicToWalletKey } from '@ton/crypto';
import { getHttpEndpoint } from '@orbs-network/ton-access';
import axios from 'axios';

@Injectable()
export class TransactionService {
  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async transaction(createTransactionDto: CreateTransactionDto) {
    const mnemonic =
      'toddler option spice motor hill mother shiver desert possible space dutch midnight cable eager category token uncle sell bus letter mercy seven census cluster';

    const key = await mnemonicToWalletKey(mnemonic.split(' '));

    const wallet = WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0,
    });

    const endpoint = await getHttpEndpoint({ network: 'testnet' });
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
          to: createTransactionDto.walletAddress,
          value: createTransactionDto.amount.toString(),
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

  async createBill(createBillDto: CreateBillDto) {
    try {
      const response = await axios.get(
        `http://easypay.vnm.bz:10007/api/MM/RegCharge?apiKey=56c1e562-8a16-43a7-922b-607f1a3cb764&chargeType=${createBillDto.paymentMethod}&amount=${createBillDto.amount}&requestId=test01&callback=https://tonshop-be.onrender.com/transaction/momo_callback&redirectFrontEnd_url=https://ton-shop.onrender.com/transactionStatus`,
      );

      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all transaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
