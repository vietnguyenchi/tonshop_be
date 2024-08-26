import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/momo_callback')
  getHello(
    @Query('chargeId') chargeId: string,
    @Query('chargeType') chargeType: string,
    @Query('chargeCode') chargeCode: string,
    @Query('regAmount') regAmount: string,
    @Query('status') status: string,
    @Query('chargeAmount') chargeAmount: string,
    @Query('requestId') requestId: string,
    @Query('signature') signature: string,
    @Query('momoTransId') momoTransId: string,
    @Query('result') result: string,
    @Query('usdRate') usdRate: string,
    @Query('usdAmount') usdAmount: string,
  ) {
    return this.appService.getHello({
      chargeId,
      chargeType,
      chargeCode,
      regAmount,
      status,
      chargeAmount,
      requestId,
      signature,
      momoTransId,
      result,
      usdRate,
      usdAmount,
    });
  }
}
