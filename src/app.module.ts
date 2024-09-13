import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import { ChainService } from './chain/chain.service';
import { ChainModule } from './chain/chain.module';
import { BotModule } from './bot/bot.module';
import { TransactionService } from './transaction/transaction.service';
import { TonModule } from './ton/ton.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    TransactionModule,
    ChainModule,
    BotModule,
    TonModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChainService, TransactionService],
})
export class AppModule {}
