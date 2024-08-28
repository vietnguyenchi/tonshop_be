import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateBillDto } from './dto/create-bill.dto';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Query() walletAddress: string, @Query() amount: number) {
    return this.transactionService.transaction({ walletAddress, amount });
  }

  @Post('create-bill')
  async createBill(@Body() createBillDto: CreateBillDto) {
    return this.transactionService.createBill(createBillDto);
  }
}
