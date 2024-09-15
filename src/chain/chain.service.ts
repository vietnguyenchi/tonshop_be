import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateChainDto } from './dto/create-chain.dto';
import { DatabaseService } from 'src/database/database.service';
import { UpdateChainDto } from './dto/update-chain.dto';

@Injectable()
export class ChainService {
   constructor(private readonly databaseService: DatabaseService) {}

   async createChain(createChainDto: CreateChainDto) {
      try {
         return this.databaseService.chain.create({
            data: createChainDto,
         });
      } catch (error) {
         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
   }

   async findAll() {
      try {
         return this.databaseService.chain.findMany({
            orderBy: {
               status: 'asc',
            },
         });
      } catch (error) {
         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
   }

   async findOne(id: string) {
      try {
         return this.databaseService.chain.findUnique({
            where: { id },
         });
      } catch (error) {
         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
   }

   async update(id: string, updateChainDto: UpdateChainDto) {
      try {
         return this.databaseService.chain.update({
            where: { id },
            data: updateChainDto,
         });
      } catch (error) {
         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
   }

   async remove(id: string) {
      try {
         return this.databaseService.chain.delete({
            where: { id },
         });
      } catch (error) {
         throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
   }
}
