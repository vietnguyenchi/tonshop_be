import { Module } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ChainController } from './chain.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [ChainController],
  providers: [ChainService, DatabaseService],
})
export class ChainModule {}
