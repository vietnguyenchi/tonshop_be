import {
   Controller,
   Get,
   Post,
   Body,
   Patch,
   Param,
   HttpException,
   Delete,
   UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { User } from './interfaces/user.interface';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
   constructor(private readonly userService: UserService) {}

   @Post()
   @Roles('admin', 'user')
   async create(@Body() createUserDto: Prisma.UserCreateInput): Promise<User> {
      return this.userService.create(createUserDto);
   }

   @Get()
   @Roles('admin')
   async findAll(): Promise<User[]> {
      return this.userService.findAll();
   }

   @Get(':id')
   @Roles('admin')
   async findOne(@Param('id') id: string): Promise<User> {
      return this.userService.findOne(id);
   }

   @Patch(':id')
   @Roles('user')
   async update(
      @Param('id') id: string,
      @Body() updateUserDto: Prisma.UserUpdateInput,
   ): Promise<User> {
      return this.userService.update(id, updateUserDto);
   }

   @Delete(':id')
   @Roles('admin')
   async remove(@Param('id') id: string) {
      return this.userService.remove(id);
   }
}
