import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginAdminDto } from './dto/login-admin.dto';

@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) {}

   @Post('login')
   async login(@Body() loginDto: LoginDto) {
      const { access_token, user } = await this.authService.login(loginDto);

      return {
         access_token,
         user,
      };
   }

   @Post('login-admin')
   async loginAdmin(@Body() loginAdminDto: LoginAdminDto) {
      const { access_token } = await this.authService.loginAdmin(loginAdminDto);

      return {
         access_token,
      };
   }
}
