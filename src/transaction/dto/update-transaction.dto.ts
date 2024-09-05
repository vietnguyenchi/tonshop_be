import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateTransactionDto {
  @IsEnum(Status)
  status: Status;
}
