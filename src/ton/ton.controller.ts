import { Body, Controller, Post } from '@nestjs/common';
import { TonService } from './ton.service';
import { TransferTonDto } from './dto/transfer-ton.dto';

@Controller('ton')
export class TonController {
   constructor(private readonly tonService: TonService) {}

   @Post()
   async createTransaction(@Body() createTransactionDto: TransferTonDto) {
      return this.tonService.sendTransaction(
         createTransactionDto.walletAddress,
         createTransactionDto.quantity,
         createTransactionDto.chainId,
         createTransactionDto.message,
      );
   }
}
