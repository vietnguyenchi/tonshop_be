import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import { ChainService } from './chain/chain.service';
import { ChainModule } from './chain/chain.module';

@Module({
  imports: [DatabaseModule, AuthModule, UserModule, TransactionModule, ChainModule],
  controllers: [AppController],
  providers: [AppService, ChainService],
})
export class AppModule {}
