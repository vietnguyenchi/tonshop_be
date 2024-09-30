import { TonRepository } from './ton.repository';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TonService } from './ton.service';
import { TransferTonDto } from './dto/transfer-ton.dto';
import { TransactionTonDto } from './dto/transaction-ton.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('ton')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TonController {
   constructor(
      private readonly tonService: TonService,
      private readonly tonRepository: TonRepository,
   ) {}

   @Post('send')
   async createTransaction(@Body() createTransactionDto: TransferTonDto) {
      return this.tonService.transferTON(
         createTransactionDto.walletAddress,
         createTransactionDto.quantity,
         createTransactionDto.chainId,
         createTransactionDto.message,
      );
   }

   // @Post('transaction')
   // async transactionTon(@Body() transactionTonDto: TransactionTonDto) {
   //    return this.tonService.transactionTon(
   //       transactionTonDto.walletAddress,
   //       transactionTonDto.quantity,
   //       transactionTonDto.message,
   //       transactionTonDto.network,
   //       transactionTonDto.apiKey,
   //    );
   // }

   @Get('transactions')
   async getAllTransactions(
      @Query('page') page: number,
      @Query('limit') limit: number,
   ) {
      return this.tonService.getAllTransactions(page, limit);
   }

   @Get('search')
   async searchTransactionByCode(@Query('code') code: string) {
      return this.tonRepository.searchTransactionByCode(code);
   }
}
