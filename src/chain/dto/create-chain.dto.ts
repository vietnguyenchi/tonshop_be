import { StatusChain } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateChainDto {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsEnum(StatusChain)
  status: StatusChain;

  @IsString()
  rpcUrl: string;
}
