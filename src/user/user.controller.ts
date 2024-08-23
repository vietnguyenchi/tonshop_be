import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  HttpException,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { User } from './interfaces/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: Prisma.UserCreateInput): Promise<User> {
    try {
      return this.userService.create(createUserDto);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get()
  async findAll(): Promise<User[]> {
    try {
      return this.userService.findAll();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      return this.userService.findOne(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      return this.userService.update(id, updateUserDto);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Delete(':telegramId')
  async remove(@Param('telegramId') telegramId: string) {
    try {
      return await this.userService.remove(telegramId);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
