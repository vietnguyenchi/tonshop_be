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
      const token = this.extractTokenFromHeader(req);

      if (!token) {
         throw new UnauthorizedException('No token provided');
      }

      try {
         const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
         });
         const user = await this.databaseService.user.findUnique({
            where: { telegramId: payload.telegramId },
         });

         if (user) {
            req['user'] = {
               telegramId: user.telegramId,
               username: user.username,
               role: user.role,
               id: user.id,
            };
         }
      } catch {
         throw new UnauthorizedException('Invalid token');
      }

      next();
   }

   private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
   }
}
