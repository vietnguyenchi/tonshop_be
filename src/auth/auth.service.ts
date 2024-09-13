import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { DatabaseService } from './../database/database.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
   constructor(
      private readonly databaseService: DatabaseService,
      private readonly jwtService: JwtService,
   ) {}

   // async login(loginDto: LoginDto): Promise<{ access_token: string }> {
   async login(loginDto: LoginDto): Promise<User> {
      try {
         let user = await this.databaseService.user.findUnique({
            where: { telegramId: loginDto.telegramId },
         });

         if (!user) {
            user = await this.databaseService.user.create({
               data: {
                  telegramId: loginDto.telegramId,
                  username: loginDto.username,
                  firstName: loginDto.firstName,
                  lastName: loginDto.lastName,
                  photoUrl: loginDto.photoUrl,
                  hash: loginDto.hash,
                  authDate: loginDto.authDate,
               },
            });
         }

         // const payload = { sub: user.id, username: user.username };
         // return {
         //    access_token: this.jwtService.sign(payload),
         // };
         return user;
      } catch (error) {
         throw new UnauthorizedException();
      }
   }
}
