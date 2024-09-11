import { PartialType } from '@nestjs/mapped-types';
import { CreateChainDto } from './create-chain.dto';
import { IsString, IsEnum } from 'class-validator';
import { StatusChain } from '@prisma/client';

export class UpdateChainDto extends PartialType(CreateChainDto) {
  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsEnum(StatusChain)
  status: StatusChain;
}
