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
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
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

  @Get('momo_callback')
  async handleMomoCallback(
    @Query(ValidationPipe) momoCallbackDto: MomoCallbackDto,
  ) {
    try {
      const transaction =
        await this.transactionService.handleMomoCallback(momoCallbackDto);
      return {
        ...momoCallbackDto,
        transactionId: transaction.id,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to process MoMo callback',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
