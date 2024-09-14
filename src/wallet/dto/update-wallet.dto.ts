import { PartialType } from '@nestjs/mapped-types';
import { CreateWalletDto } from './create-wallet.dto';
import { StatusWallet } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateWalletDto extends PartialType(CreateWalletDto) {
   @IsString()
   @IsOptional()
   name: string;

   @IsString()
   @IsOptional()
   privateKey: string;

   @IsEnum(StatusWallet)
   @IsOptional()
   status: StatusWallet;
}
