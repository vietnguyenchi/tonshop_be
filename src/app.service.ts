import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private telegramBotToken = '7058497258:AAH0oSnq-ujVID2UKfpj96MCmPzaoG3CiL4';
  private telegramChatId = '5441070581';

  async sendTelegramNotification(message: string) {
    const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
    const body = {
      chat_id: this.telegramChatId,
      text: message,
    };

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      console.log('Telegram message sent successfully');
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }

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
