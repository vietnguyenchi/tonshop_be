import { Controller, Get, Query } from '@nestjs/common';
// import { TransactionService } from './transaction.service';
import { TransactionGateway } from './transaction.gateway';

@Controller('transaction')
export class TransactionController {
  constructor(
    // private readonly transactionService: TransactionService,
    private readonly transactionGateway: TransactionGateway, // Inject Gateway
  ) {}

  @Get('api/momo_callback')
  async handleTransactionStatus(
    @Query('chargeId') chargeId: string,
    @Query('chargeType') chargeType: string,
    @Query('chargeCode') chargeCode: string,
    @Query('regAmount') regAmount: string,
    @Query('chargeAmount') chargeAmount: string,
    @Query('status') status: string,
    @Query('requestId') requestId: string,
    @Query('signature') signature: string,
    @Query('momoTransId') momoTransId: string,
    @Query('result') result: string,
    @Query('usdRate') usdRate: string,
    @Query('usdAmount') usdAmount: string,
  ) {
    const transactionInfo = {
      chargeId,
      chargeType,
      chargeCode,
      regAmount,
      chargeAmount,
      status,
      requestId,
      signature,
      momoTransId,
      result,
      usdRate,
      usdAmount,
    };

    this.transactionGateway.notifyTransactionStatus(transactionInfo);

    return { message: 'Transaction processed', status };
  }
}
