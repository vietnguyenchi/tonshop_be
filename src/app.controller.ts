import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api/momo_callback')
  async getHello(
    @Query('chargeId') chargeId: string,
    @Query('chargeType') chargeType: string,
    @Query('chargeCode') chargeCode: string,
    @Query('regAmount') regAmount: string,
    @Query('chargeAmount') chargeAmount: string,
    @Query('status') status: string,
    @Query('requestId') requestId: string,
    @Query('signature') signature: string,
    @Query('momoTransId') momoTransId: string,
    @Query('result') result: string,
    @Query('usdRate') usdRate: string,
    @Query('usdAmount') usdAmount: string,
  ) {
    await this.appService.sendTelegramNotification(
      JSON.stringify({
        chargeId,
        chargeType,
        chargeCode,
        regAmount,
        chargeAmount,
        status,
        requestId,
        signature,
        momoTransId,
        result,
        usdRate,
        usdAmount,
      }),
    );
  }
}
