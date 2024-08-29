import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionGateway } from './transaction.gateway';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Prisma } from '@prisma/client';
import { CreateTonTransactionDto } from './dto/create-tonTransaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly transactionGateway: TransactionGateway,
  ) {}

  @Post()
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Post('/ton')
  async transactionTon(@Body() createTransactionDto: CreateTonTransactionDto) {
    return this.transactionService.transactionTon(createTransactionDto);
  }

  @Get('api/momo_callback')
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
    return {
      chargeId,
      chargeType,
      chargeCode,
      regAmount,
      chargeAmount,
      status,
      requestId,
      signature,
      messages: 'Payment success',
    };
  }

  @Get('/waiting')
  async findWaitingTransactions() {
    return this.transactionService.findWaitingTransactions();
  }

  @Post('update')
  async updateTransactionStatus(
    @Query('chargeId') chargeId: string,
    @Body() updateTransactionDto: Prisma.transactionUpdateInput,
  ) {
    return this.transactionService.updateTransactionStatus(
      chargeId,
      updateTransactionDto,
    );
  }

  @Get('find')
  async findTransactionByChargeId(@Query('chargeId') chargeId: string) {
    return this.transactionService.findTransactionByChargeId(chargeId);
  }

  @Get()
  async findAll() {
    return this.transactionService.findAllTransactions();
  }

  @Get('check')
  async checkTransactionStatus(@Query('chargeId') chargeId: string) {
    return this.transactionService.checkTransactionStatus(chargeId);
  }
}
