import { Injectable } from '@nestjs/common';
import { CreateChainDto } from './dto/create-chain.dto';
import { UpdateChainDto } from './dto/update-chain.dto';
import { DatabaseService } from 'src/database/database.service';
import { StatusChain } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChainService {
  constructor(private readonly databaseService: DatabaseService) {}
  create(createChainDto: CreateChainDto) {
    return this.databaseService.chain.create({
      data: {
        ...createChainDto,
        status: createChainDto.status as StatusChain,
      },
    });
  }

  findAll() {
    return this.databaseService.chain.findMany({
      orderBy: {
        createdAt: 'desc',
      } as Prisma.ChainOrderByWithRelationInput,
    });
  }

  findOne(id: string) {
    return this.databaseService.chain.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updateChainDto: UpdateChainDto) {
    return this.databaseService.chain.update({
      where: {
        id,
      },
      data: {
        ...updateChainDto,
        status: updateChainDto.status as StatusChain,
      },
    });
  }

  remove(id: string) {
    return this.databaseService.chain.delete({
      where: {
        id,
      },
    });
  }
}
