import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(
    '/api/momo_callback/:chargeId/:chargeType/:chargeCode/:regAmount/:chargeAmount/:status/:requestId/:signature/:momoTransId/:result/:usdRate/:usdAmount',
  )
  getHello(
    @Param() chargeId?: string,
    chargeType?: string,
    chargeCode?: string,
    regAmount?: string,
    chargeAmount?: string,
    status?: string,
    requestId?: string,
    signature?: string,
    momoTransId?: string,
    result?: string,
    usdRate?: string,
    usdAmount?: string,
  ) {
    const data = {
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
    };

    return this.appService.getHello(data);
  }
}
