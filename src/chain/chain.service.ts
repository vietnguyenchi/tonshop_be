import { Injectable } from '@nestjs/common';
import { CreateChainDto } from './dto/create-chain.dto';
import { DatabaseService } from 'src/database/database.service';
import { CreateNetworkDto } from './dto/create-network.dto';

@Injectable()
export class ChainService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createChain(createChainDto: CreateChainDto) {
    return this.databaseService.chain.create({
      data: createChainDto,
    });
  }

  // async createNetwork(createNetworkDto: CreateNetworkDto) {
  //   return this.databaseService.network.create({
  //     data:
  //   });
  // }

  // ... other methods for managing chains and networks ...
}
