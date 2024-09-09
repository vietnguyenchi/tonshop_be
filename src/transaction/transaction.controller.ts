import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Patch,
  Param,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionGateway } from './transaction.gateway';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTonTransactionDto } from './dto/create-tonTransaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { MomoCallbackDto } from './dto/momo-callback.dto';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private transactionGateway: TransactionGateway,
  ) {}

  @Post()
  async createTransaction(
    @Body(ValidationPipe) createTransactionDto: CreateTransactionDto,
  ) {
    try {
      return await this.transactionService.createTransaction(
        createTransactionDto,
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          error.message || 'Failed to create transaction',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Post('ton')
  async createTonTransaction(
    @Body(ValidationPipe) createTonTransactionDto: CreateTonTransactionDto,
  ) {
    try {
      return await this.transactionService.transactionTon(
        createTonTransactionDto,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to create TON transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('momo_callback')
  async handleMomoCallback(
    @Query(ValidationPipe) momoCallbackDto: MomoCallbackDto,
  ) {
    try {
      await this.transactionService.createMomoCallback(momoCallbackDto);
      return {
        ...momoCallbackDto,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to process MoMo callback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('waiting/:userId')
  async getWaitingTransactions(@Param('userId') userId: string) {
    try {
      return await this.transactionService.findWaitingTransactions(userId);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch waiting transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':chargeId')
  async updateTransactionStatus(
    @Param('chargeId') chargeId: string,
    @Body(ValidationPipe) updateTransactionDto: UpdateTransactionDto,
  ) {
    try {
      return await this.transactionService.updateTransactionStatus(
        chargeId,
        updateTransactionDto,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to update transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('test-callBack')
  testCallBack() {
    this.transactionGateway.notifyTransactionStatus({
      status: 'success',
      message: 'Transaction status updated',
      transactionDetails: {
        id: '1',
        chargeId: '1838640',
        amount: 12300,
        code: '123456',
        chargeType: 'momo',
        redirect_ssl: 'https://google.com',
        quantity: 0.1,
        walletAddress: '0:b5ee9c7245978b723e0123456789abcdef',
        chain: 'testnet',
        status: 'success',
        createdAt: '2024-05-01T00:00:00Z',
        updatedAt: '2024-05-01T00:00:00Z',
        userId: '5441070581',
        exchangeRate: 125.889,
        transactionFee: 0,
      },
    });

    return {
      status: 'success',
      message: 'Transaction status updated',
    };
  }

  @Get(':chargeId')
  async getTransactionByChargeId(@Param('chargeId') chargeId: string) {
    try {
      return await this.transactionService.findTransactionByChargeId(chargeId);
    } catch (error) {
      throw new HttpException(
        'Failed to find transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all/:userId')
  async findAllTransactions(@Param('userId') userId: string) {
    try {
      return await this.transactionService.findAllTransactions(userId);
    } catch (error) {
      throw new HttpException(
        'Failed to find all transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check/:chargeId')
  async checkTransactionStatus(@Param('chargeId') chargeId: string) {
    try {
      await this.transactionService.checkTransactionStatus(chargeId);
    } catch (error) {
      throw new HttpException(
        'Failed to check transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
