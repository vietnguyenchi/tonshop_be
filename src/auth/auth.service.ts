import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { DatabaseService } from './../database/database.service';

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async login(loginDto: LoginDto): Promise<User> {
    let user = await this.databaseService.user.findFirst({
      where: { username: loginDto.username },
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

    return user;
  }
}
