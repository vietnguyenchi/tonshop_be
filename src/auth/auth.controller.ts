import {
   Controller,
   Request,
   Post,
   UseGuards,
   Body,
   Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) {}

   @UseGuards(AuthGuard('local'))
   @Post('login')
   async login(
      @Body() loginDto: LoginDto,
      @Res({ passthrough: true }) response: Response,
   ) {
      const { access_token, user } = await this.authService.login(loginDto);

      // Set the access token as an HTTP-only cookie
      response.cookie('access_token', access_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
         sameSite: 'strict',
         maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return { user };
   }
}
