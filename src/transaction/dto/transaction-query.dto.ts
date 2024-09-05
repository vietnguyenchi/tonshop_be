import { IsString, IsOptional } from 'class-validator';

export class TransactionQueryDto {
  @IsString()
  @IsOptional()
  userId?: string;
}
