import { Body, Controller, Post } from '@nestjs/common';
import { TonService } from './ton.service';

@Controller('ton')
export class TonController {
   constructor(private readonly tonService: TonService) {}

   @Post()
   async createTransaction(@Body() createTransactionDto: any) {
      return this.tonService.sendTransaction(
         createTransactionDto.recipientAddress,
         createTransactionDto.amount,
         createTransactionDto.chainId,
         createTransactionDto.message,
      );
   }
}
