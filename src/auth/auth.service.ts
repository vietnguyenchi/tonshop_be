import {
   HttpException,
   HttpStatus,
   Injectable,
   NotFoundException,
   UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { DatabaseService } from './../database/database.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAdminDto } from './dto/login-admin.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AuthService {
   constructor(
      private databaseService: DatabaseService,
      private jwtService: JwtService,
   ) {}

   async login(
      loginDto: LoginDto,
   ): Promise<{ access_token: string; user: User }> {
      try {
         let user = await this.databaseService.user.findUnique({
            where: { telegramId: loginDto.telegramId },
         });

         if (!user) {
            const userData = {
               telegramId: loginDto.telegramId,
               username: loginDto.username,
               firstName: loginDto.firstName,
               lastName: loginDto.lastName,
               password: loginDto.password,
               photoUrl: loginDto.photoUrl,
               hash: loginDto.hash,
               authDate: new Date(loginDto.authDate).toISOString(),
            };

            if (loginDto.password) {
               const hashedPassword = await bcrypt.hash(loginDto.password, 10);
               userData.password = hashedPassword;
            }

            user = await this.databaseService.user.create({ data: userData });
         }

         const payload = {
            username: user.username,
            telegramId: user.telegramId,
            role: user.role,
         };
         return {
            access_token: this.jwtService.sign(payload),
            user: user,
         };
      } catch (error) {
         console.log(error);
         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
   }

   async validateUser(telegramId: string): Promise<User> {
      const user = await this.databaseService.user.findUnique({
         where: { telegramId },
      });
      return user;
   }

   async loginAdmin(
      loginAdminDto: LoginAdminDto,
   ): Promise<{ access_token: string }> {
      try {
         const user = await this.databaseService.user.findUnique({
            where: { username: loginAdminDto.username },
         });

         if (!user) {
            throw new NotFoundException('User not found');
         }

         const isMatch = await bcrypt.compare(
            loginAdminDto.password,
            user.password,
         );

         if (!isMatch) {
            throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
         }
         const payload = {
            username: user.username,
            telegramId: user.telegramId,
            role: user.role,
         };

         return {
            access_token: this.jwtService.sign(payload),
         };
      } catch (error) {
         console.log(error);
         throw new HttpException('Login failed', HttpStatus.BAD_REQUEST);
      }
   }
}
