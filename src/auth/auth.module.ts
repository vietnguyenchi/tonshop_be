import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../database/database.module';

@Module({
   imports: [
      DatabaseModule,
      PassportModule,
      JwtModule.register({
         secret: process.env.JWT_SECRET,
         signOptions: { expiresIn: '1h' },
      }),
   ],
   providers: [AuthService],
   controllers: [AuthController],
   exports: [AuthService],
})
export class AuthModule {}
