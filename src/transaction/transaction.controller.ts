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
   UseGuards,
   Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { MomoCallbackDto } from './dto/momo-callback.dto';
import { Roles } from 'src/auth/roles.decorator';

@Controller('transaction')
export class TransactionController {
   constructor(private readonly transactionService: TransactionService) {}

   @Post()
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin', 'user')
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

   @Patch(':chargeId')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin', 'user')
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
   @UseGuards()
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

   @Get(':id')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin', 'user')
   async getTransactionById(@Param('id') id: string) {
      try {
         return await this.transactionService.findTransactionById(id);
      } catch (error) {
         throw new HttpException(
            'Failed to find transaction',
            HttpStatus.INTERNAL_SERVER_ERROR,
         );
      }
   }

   @Get()
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin')
   async findAllTransactions(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
   ) {
      return await this.transactionService.findAllTransactions(page, limit);
   }

   @Get('all/:telegramId')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin', 'user')
   async findAllTransactionsByUserId(
      @Param('telegramId') telegramId: string,
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
   ) {
      try {
         return await this.transactionService.findAllTransactionsByTelegramId(
            telegramId,
            page,
            limit,
         );
      } catch (error) {
         throw new HttpException(
            'Failed to find all transactions',
            HttpStatus.INTERNAL_SERVER_ERROR,
         );
      }
   }

   @Get('check/:chargeId')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin', 'user')
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

   // @Delete(':chargeId')
   // @UseGuards(JwtAuthGuard, RolesGuard)
   // @Roles('admin')
   // async deleteTransaction(@Param('chargeId') chargeId: string) {
   //    try {
   //       return await this.transactionService.deleteTransaction(chargeId);
   //    } catch (error) {
   //       throw new HttpException(
   //          'Failed to delete transaction',
   //          HttpStatus.INTERNAL_SERVER_ERROR,
   //       );
   //    }
   // }
}
