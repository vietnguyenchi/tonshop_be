import { Status } from '@prisma/client';
import { IsEnum, IsString, IsNumber } from 'class-validator';

export class UpdateTransactionTonDto {
   @IsString()
   lt: string;

   @IsString()
   hash: string;

   @IsNumber()
   quantity: number;

   @IsEnum(Status)
   status: Status;
}
