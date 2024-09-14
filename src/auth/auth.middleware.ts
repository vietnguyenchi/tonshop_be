import {
   Injectable,
   NestMiddleware,
   UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
   constructor(
      private jwtService: JwtService,
      private databaseService: DatabaseService,
   ) {}

   async use(req: Request, res: Response, next: NextFunction) {
      let token;
      if (req.cookies.access_token) {
         token = req.cookies.access_token;
      } else {
         token = this.extractTokenFromHeader(req);
      }

      if (!token) {
         throw new UnauthorizedException();
      }

      try {
         const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
         });
         const user = await this.databaseService.user.findUnique({
            where: { telegramId: payload.telegramId },
         });

         if (user) {
            req['user'] = user;
         }
      } catch {
         // If token is invalid, we don't set the user
      }

      next();
   }

   private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
   }
}
