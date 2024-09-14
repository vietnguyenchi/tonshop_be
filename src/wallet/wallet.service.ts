import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { DatabaseService } from 'src/database/database.service';
import { StatusWallet } from '@prisma/client';

@Injectable()
export class WalletService {
   constructor(private readonly databaseService: DatabaseService) {}

   async create(createWalletDto: CreateWalletDto) {
      try {
         const wallet = await this.databaseService.wallet.create({
            data: {
               ...createWalletDto,
               status: createWalletDto.status as StatusWallet,
            },
         });

         return wallet;
      } catch (error) {
         throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async findAll() {
      try {
         const wallet = await this.databaseService.wallet.findMany();

         return wallet;
      } catch (error) {
         throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async findOne(id: string) {
      try {
         const wallet = await this.databaseService.wallet.findUnique({
            where: {
               id,
            },
         });

         return wallet;
      } catch (error) {
         throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async update(id: string, updateWalletDto: UpdateWalletDto) {
      try {
         if (!id) {
            throw new HttpException('Id is required', HttpStatus.BAD_REQUEST);
         }

         if (updateWalletDto.status === 'active') {
            await this.databaseService.wallet.updateMany({
               where: {
                  status: 'active',
               },
               data: {
                  status: 'disabled',
               },
            });
         }

         const wallet = await this.databaseService.wallet.update({
            where: {
               id,
            },
            data: {
               ...updateWalletDto,
            },
         });

         return wallet;
      } catch (error) {
         throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }

   async remove(id: string) {
      try {
         const wallet = await this.databaseService.wallet.delete({
            where: {
               id,
            },
         });

         return wallet;
      } catch (error) {
         throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
   }
}
