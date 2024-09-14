import {
   Controller,
   Get,
   Post,
   Body,
   Patch,
   Param,
   Delete,
   UseGuards,
} from '@nestjs/common';
import { ChainService } from './chain.service';
import { CreateChainDto } from './dto/create-chain.dto';
import { UpdateChainDto } from './dto/update-chain.dto';
import { Inject } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('chain')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChainController {
   constructor(
      @Inject(ChainService)
      private readonly chainService: ChainService,
   ) {}

   @Post()
   @Roles('admin')
   create(@Body() createChainDto: CreateChainDto) {
      return this.chainService.createChain(createChainDto);
   }

   @Get()
   @Roles('admin', 'user')
   findAll() {
      return this.chainService.findAll();
   }

   @Get(':id')
   @Roles('admin')
   findOne(@Param('id') id: string) {
      return this.chainService.findOne(id);
   }

   @Patch(':id')
   @Roles('admin')
   update(@Param('id') id: string, @Body() updateChainDto: UpdateChainDto) {
      return this.chainService.update(id, updateChainDto);
   }

   @Delete(':id')
   @Roles('admin')
   remove(@Param('id') id: string) {
      return this.chainService.remove(id);
   }
}
