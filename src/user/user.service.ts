import { DatabaseService } from './../database/database.service';
import { HttpException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
   constructor(private readonly databaseService: DatabaseService) {}

   create(createUserDto: Prisma.UserCreateInput) {
      try {
         return this.databaseService.user.create({ data: createUserDto });
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }

   findAll() {
      try {
         return this.databaseService.user.findMany();
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }

   findOne(id: string) {
      try {
         return this.databaseService.user.findUnique({ where: { id } });
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }

   update(id: string, updateUserDto: Prisma.UserUpdateInput) {
      try {
         return this.databaseService.user.update({
            where: { id },
            data: updateUserDto,
         });
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }

   remove(id: string) {
      try {
         return this.databaseService.user.delete({ where: { id } });
      } catch (error) {
         throw new HttpException(error.message, error.status);
      }
   }
}
