import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) {}

   @Post('login')
   @Roles()
   async login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) response: Response,
   ) {
      const { access_token, user } = await this.authService.login(loginDto);

      // Set the access token as an HTTP-only cookie
      response.cookie('access_token', access_token, {
         httpOnly: true,
         secure: true, // Use secure cookies in production
         sameSite: 'strict',
         maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return {
         user,
         access_token,
      };
   }
}
