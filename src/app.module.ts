import {
   Module,
   MiddlewareConsumer,
   NestModule,
   RequestMethod,
} from '@nestjs/common';
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
import { WalletModule } from './wallet/wallet.module';
import { AuthMiddleware } from './auth/auth.middleware';
import { JwtService } from '@nestjs/jwt';
// import { AuthMiddleware } from './auth/auth.middleware';

@Module({
   imports: [
      DatabaseModule,
      AuthModule,
      UserModule,
      TransactionModule,
      ChainModule,
      BotModule,
      TonModule,
      WalletModule,
   ],
   controllers: [AppController],
   providers: [AppService, ChainService, TransactionService, JwtService],
})
export class AppModule implements NestModule {
   configure(consumer: MiddlewareConsumer) {
      consumer
         .apply(AuthMiddleware)
         // .exclude({ path: 'auth/login', method: RequestMethod.POST })
         // .exclude({ path: 'auth/login-admin', method: RequestMethod.POST })
         // .exclude({ path: 'transaction/:id', method: RequestMethod.GET })
         .forRoutes({ path: '*', method: RequestMethod.ALL });
   }
}
