// import { IsNumber, IsOptional, IsString } from 'class-validator';

export class MomoCallbackDto {
  chargeId?: string;

  chargeType?: string;

  chargeCode?: string;

  regAmount?: number;

  chargeAmount?: string;

  status?: string;

  orderId?: string;

  requestId?: string;

  signature?: string;

  momoTransId?: string;

  result?: string;

  usdtRate?: number;

  usdAmount?: number;
}
