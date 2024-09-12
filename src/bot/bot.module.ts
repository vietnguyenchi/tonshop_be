import { Module } from '@nestjs/common';
import { BotService } from './bot.service';

@Module({
  providers: [
    {
      provide: BotService,
      useFactory: () => BotService.getInstance(),
    },
  ],
  exports: [BotService],
})
export class BotModule {}
