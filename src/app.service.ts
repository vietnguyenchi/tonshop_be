import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(data: any): any {
    if (!data.chargeId) {
      return {
        message: 'chargeId is required',
      };
    }
    console.log(data);
    return {
      message: 'Hello World!',
      data,
    };
  }
}
