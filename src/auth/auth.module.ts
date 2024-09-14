import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';

@Module({
   imports: [
      DatabaseModule,
      UserModule,
      PassportModule,
      JwtModule.register({
         secret: process.env.JWT_SECRET,
         signOptions: { expiresIn: '1h' },
      }),
   ],
   providers: [AuthService, LocalStrategy, JwtStrategy],
   controllers: [AuthController],
   exports: [AuthService],
})
export class AuthModule {}
