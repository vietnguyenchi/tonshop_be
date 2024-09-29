import { StatusChain } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateChainDto {
   @IsString()
   name: string;

   @IsString()
   symbol: string;

   @IsString()
   network: string;

   @IsEnum(StatusChain)
   status: StatusChain;

   @IsString()
   rpcUrl: string;

   @IsString()
   apiKey: string;
}
