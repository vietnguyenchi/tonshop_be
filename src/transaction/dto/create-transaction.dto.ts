import { IsString, IsNumber, IsDecimal, IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  requestId: string;
  @IsString()
  chargeType: string;

  @IsString()
  chain: string;

  @IsString()
  email: string;

  @IsDecimal()
  exchangeRate: number;

  @IsString()
  phoneNumberUser: string;

  @IsNumber()
  quantity: number;

  @IsEnum(Status)
  status: Status;

  @IsNumber()
  timeToExpired: number;

  @IsDecimal()
  transactionFee: number;

  @IsString()
  userId: string;

  @IsString()
  walletAddress: string;
}
