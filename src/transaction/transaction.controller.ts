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
// import { TransactionGateway } from './transaction.gateway';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateTonTransactionDto } from './dto/create-tonTransaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    // private readonly transactionGateway: TransactionGateway,
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
      console.log(error);
      throw new HttpException(
        'Failed to create transaction',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/ton')
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

  // @Get('api/momo_callback')
  // handleMomoCallback(@Query(ValidationPipe) momoCallbackDto: MomoCallbackDto) {
  //   this.transactionGateway.notifyTransactionStatus({
  //     ...momoCallbackDto,
  //     messages: 'Payment success',
  //   });
  //   return {
  //     ...momoCallbackDto,
  //     messages: 'Payment success',
  //   };
  // }

  @Get('/waiting/:userId')
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

  @Patch('update/:chargeId')
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

  @Get('find/:chargeId')
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

  @Get(':userId')
  async getAllTransactions(@Param('userId') userId: string) {
    try {
      return await this.transactionService.findAllTransactions(userId);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch transactions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('check/:chargeId')
  async checkTransactionStatus(@Param('chargeId') chargeId: string) {
    try {
      return await this.transactionService.checkTransactionStatus(chargeId);
    } catch (error) {
      throw new HttpException(
        'Failed to check transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
