import { Module } from '@nestjs/common';
import { BotService } from './bot.service';

@Module({
  providers: [
    {
      provide: BotService,
      useFactory: () => BotService.getInstance(process.env.BOT_TOKEN),
    },
  ],
  exports: [BotService],
})
export class BotModule {}
