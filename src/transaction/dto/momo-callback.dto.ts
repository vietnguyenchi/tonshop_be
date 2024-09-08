import { IsNumber, IsString } from 'class-validator';

export class MomoCallbackDto {
  @IsString()
  chargeId: string;

  @IsString()
  chargeType: string;

  @IsString()
  chargeCode: string;

  @IsNumber()
  regAmount: number;

  @IsString()
  chargeAmount: string;

  @IsString()
  status: string;

  @IsString()
  orderId: string;

  @IsString()
  requestId: string;

  @IsString()
  signature: string;

  @IsString()
  momoTransId: string;

  @IsString()
  result: string;

  @IsNumber()
  usdtRate: number;

  @IsNumber()
  usdAmount: number;
}
