import { CreateTransactionDto } from './dto/create-transaction.dto';
import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { MomoCallbackDto } from './dto/momo-callback.dto';
import * as CryptoJS from 'crypto-js';
import { BotService } from '../bot/bot.service';
import { TonService } from '../ton/ton.service';

const apiKeyMopay = process.env.API_KEY_MOPAY;
const signkey = process.env.SIGN_KEY;
const backendUrl = process.env.BACKEND_URL;

@Injectable()
export class TransactionService {
   constructor(
      private readonly databaseService: DatabaseService,
      private readonly botService: BotService,
      private readonly tonService: TonService,
   ) {}

   async createTransaction(createTransactionDto: CreateTransactionDto) {
      try {
         const {
            chargeType,
            requestId,
            walletAddress,
            quantity,
            chain,
            userId,
            email,
            phoneNumberUser,
            telegramId,
         } = createTransactionDto;
         const estimateGas = await this.tonService.estimateGas(
            walletAddress,
            quantity,
            chain,
            'transaction message',
         );
         const transactionFee =
            Number(estimateGas) * createTransactionDto.exchangeRate;

         const amount = Math.ceil(
            createTransactionDto.exchangeRate * quantity + transactionFee,
         );
         const sign = CryptoJS.MD5(
            `${amount}${chargeType}${requestId}${signkey}`,
         ).toString();
         const response = await axios.get(
            `https://switch.mopay.info/api13/MM/RegCharge?apiKey=${apiKeyMopay}&chargeType=${chargeType}&amount=${amount}&requestId=${requestId}&callback=${backendUrl}/transaction/momo_callback&sign=${sign}`,
         );

         const data: Prisma.TransactionCreateInput = {
            chargeId: response.data.data.id.toString(),
            bank_provider: response.data.data.chargeType,
            amount,
            quantity,
            chain,
            walletAddress,
            user: { connect: { id: userId } },
            transactionFee,
            exchangeRate: createTransactionDto.exchangeRate,
            code: response.data.data.code,
            email,
            phoneName: response.data.data.phoneName,
            phoneNumber: phoneNumberUser,
            timeToExpired: response.data.data.timeToExpired,
            phoneNum: response.data.data.phoneNum,
            qr_url: response.data.data.qr_url,
            redirect_ssl: response.data.data.redirect_ssl,
            telegramId,
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

   async findTransactionById(id: string) {
      const transaction = await this.databaseService.transaction.findUnique({
         where: { id },
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
         const status = await this.checkTransactionStatus(transaction.chargeId);
         if (status.status !== 'waiting') {
            const updatedTransaction = await this.updateTransactionStatus(
               transaction.chargeId,
               { status: status.status },
            );
            return updatedTransaction;
         }
      }

      return transaction;
   }

   async findAllTransactionsByTelegramId(
      telegramId: string,
      page: number = 1,
      limit: number = 10,
   ) {
      const skip = (page - 1) * limit;
      const [transactions, total] = await Promise.all([
         this.databaseService.transaction.findMany({
            where: { telegramId },
            orderBy: { createAt: 'desc' },
            take: Number(limit),
            skip: skip,
         }),
         this.databaseService.transaction.count({
            where: { telegramId },
         }),
      ]);

      return {
         data: transactions,
         meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
         },
      };
   }

   async findAllTransactions(page: number = 1, limit: number = 10) {
      const skip = (page - 1) * limit;
      const [transactions, total] = await Promise.all([
         this.databaseService.transaction.findMany({
            orderBy: { createAt: 'desc' },
            take: Number(limit),
            skip: skip,
         }),
         this.databaseService.transaction.count(),
      ]);

      return {
         data: transactions,
         meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
         },
      };
   }

   async checkTransactionStatus(chargeId: string) {
      try {
         const response = await axios.get(
            `https://switch.mopay.info/api13/MM/CheckCharge?apiKey=${apiKeyMopay}&id=${chargeId}`,
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

   async handleMomoCallback(momoCallbackDto: MomoCallbackDto) {
      const { chargeId, chargeAmount, regAmount, status } = momoCallbackDto;
      await this.updateTransactionStatus(chargeId, { status: 'success' });

      const transactionTon = await this.tonService.getTransactionByCode(
         momoCallbackDto.chargeCode,
      );

      if (transactionTon) {
         return;
      }

      const transaction = await this.databaseService.transaction.findUnique({
         where: { chargeId: momoCallbackDto.chargeId },
      });

      if (!transaction) return null;

      if (Number(chargeAmount) >= regAmount) {
         try {
            const message = `You have successfully made a payment of ${chargeAmount} for transaction code: ${transaction.code}. We are now processing your transaction. Please wait for the confirmation. If the transaction is not confirmed within 10 minutes, please contact support.`;
            await this.botService.sendMessage(transaction.telegramId, message);
            const result = await this.tonService.sendTransaction(
               transaction.walletAddress,
               transaction.quantity,
               transaction.chain,
               transaction.code,
            );

            if (result.status === 'success') {
               return await this.updateTransactionStatus(
                  momoCallbackDto.chargeId,
                  {
                     status: 'success',
                  },
               );
            } else {
               return await this.updateTransactionStatus(
                  momoCallbackDto.chargeId,
                  {
                     status: 'cancel',
                  },
               );
            }
         } catch (error) {
            if (transaction.telegramId) {
               const errorMessage = `There was an error processing your transaction. Please contact support with code: ${transaction.code}`;
               await this.botService.sendMessage(
                  transaction.telegramId,
                  errorMessage,
               );
            }
         }
      } else if (status === 'timeout') {
         const transactionTon = await this.tonService.getTransactionByCode(
            momoCallbackDto.chargeCode,
         );

         if (transactionTon.status === 'timeout') {
            return;
         }

         await this.updateTransactionStatus(momoCallbackDto.chargeId, {
            status: 'timeout',
         });

         const message = `Your transaction has been timed out. Please make a new payment.`;
         await this.botService.sendMessage(transaction.telegramId, message);

         return null;
      } else {
         await this.updateTransactionStatus(momoCallbackDto.chargeId, {
            status: 'success',
         });

         if (transaction.telegramId) {
            const message = `Your payment of ${chargeAmount} was received, but it's less than the required amount of ${regAmount}. Please make a new payment.`;
            await this.botService.sendMessage(transaction.telegramId, message);
         }

         return null;
      }
   }
}
