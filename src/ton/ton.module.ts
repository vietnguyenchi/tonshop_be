import { Module } from '@nestjs/common';
import { TonService } from './ton.service';
import { TonController } from './ton.controller';
import { DatabaseModule } from '../database/database.module';
import { TonRepository } from './ton.repository';

@Module({
   imports: [DatabaseModule],
   controllers: [TonController],
   providers: [TonService, TonRepository],
   exports: [TonService],
})
export class TonModule {}
