import { CreateTransactionDto } from './dto/create-transaction.dto';
import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';
import { MomoCallbackDto } from './dto/momo-callback.dto';
import * as CryptoJS from 'crypto-js';
import { BotService } from '../bot/bot.service';
import { TonService } from '../ton/ton.service';

const frontend_url = process.env.FRONTEND_URL;
const backend_url = process.env.BACKEND_URL;
const apiKeyMopay = process.env.API_KEY_MOPAY;
const signkey = process.env.SIGN_KEY;
@Injectable()
export class TransactionService {
   constructor(
      private readonly databaseService: DatabaseService,
      private readonly botService: BotService,
      private readonly tonService: TonService,
   ) {}

   async createTransaction(createTransactionDto: CreateTransactionDto) {
      try {
         const amount = parseInt(
            Math.ceil(
               createTransactionDto.exchangeRate *
                  createTransactionDto.quantity +
                  createTransactionDto.transactionFee,
            ).toString(),
         );
         const chargeType = createTransactionDto.chargeType;
         const requestId = createTransactionDto.requestId;
         const sign = CryptoJS.MD5(
            `${amount}${chargeType}${requestId}${signkey}`,
         ).toString();
         const response = await axios.get(
            `https://switch.mopay.info/api13/MM/RegCharge?apiKey=${apiKeyMopay}&chargeType=${chargeType}&amount=${amount}&requestId=${requestId}&callback=${backend_url}/transaction/momo_callback&redirectFrontEnd_url=${frontend_url}&sign=${sign}`,
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
            take: limit,
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
            take: limit,
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

   async sendTelegramMessage(telegramId: string, message: string) {
      try {
         await this.botService.sendMessage(telegramId, message);
      } catch (error) {
         console.error('Error sending Telegram message:', error);
      }
   }

   async handleMomoCallback(momoCallbackDto: MomoCallbackDto) {
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
               this.tonService.sendTransaction(
                  transaction.walletAddress,
                  transaction.quantity,
                  transaction.chain,
                  transaction.code,
               );

               const updatedTransaction = await this.updateTransactionStatus(
                  momoCallbackDto.chargeId,
                  {
                     status: 'success',
                  },
               );

               const message = `
               Transaction success
               Code: ${transaction.code}
               Please save this code for future reference.`;
               await this.sendTelegramMessage(transaction.telegramId, message);

               return updatedTransaction;
            } catch (error) {
               if (transaction.telegramId) {
                  const errorMessage = `There was an error processing your transaction. Please contact support with code: ${transaction.code}`;
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

            if (transaction.telegramId) {
               const message = `Your payment of ${chargeAmount} was received, but it's less than the required amount of ${regAmount}. Please contact support for assistance.`;
               await this.sendTelegramMessage(transaction.telegramId, message);
            }

            return null;
         }
      }
   }
}
