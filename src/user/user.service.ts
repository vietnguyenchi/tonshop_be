import { DatabaseService } from './../database/database.service';
import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
   constructor(private readonly databaseService: DatabaseService) {}

   async create(createUserDto: Prisma.UserCreateInput) {
      try {
         return await this.databaseService.user.create({ data: createUserDto });
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }

   async findAll() {
      try {
         return await this.databaseService.user.findMany();
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }

   async findOne(id: string) {
      try {
         return await this.databaseService.user.findUnique({ where: { id } });
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }

   async update(id: string, updateUserDto: Prisma.UserUpdateInput) {
      try {
         return await this.databaseService.user.update({
            where: { id },
            data: updateUserDto,
         });
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }

   async remove(id: string) {
      try {
         return await this.databaseService.user.delete({ where: { id } });
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }
}
