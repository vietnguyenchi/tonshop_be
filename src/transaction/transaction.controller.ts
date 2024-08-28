import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { TransactionGateway } from './transaction.gateway';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionGateway: TransactionGateway,
  ) {}

  @Post()
  async create(@Query() walletAddress: string, @Query() amount: number) {
    return this.transactionService.transaction({ walletAddress, amount });
  }

  @Post('create-bill')
  async createBill(@Body() createBillDto: CreateBillDto) {
    return this.transactionService.createBill(createBillDto);
  }

  @Get('momo_callback')
  handlePaymentCallback(
    @Query('chargeId') chargeId: string,
    @Query('chargeType') chargeType: string,
    @Query('chargeCode') chargeCode: string,
    @Query('regAmount') regAmount: string,
    @Query('chargeAmount') chargeAmount: string,
    @Query('status') status: string,
    @Query('requestId') requestId: string,
    @Query('signature') signature: string,
  ) {
    this.transactionGateway.notifyTransactionStatus({
      chargeId,
      chargeType,
      chargeCode,
      regAmount,
      chargeAmount,
      status,
      requestId,
      signature,
      messages: 'Payment success',
    });
    return { status: 'success' };
  }
}
