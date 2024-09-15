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
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
   constructor(private readonly walletService: WalletService) {}

   @Post()
   @Roles('admin')
   create(@Body() createWalletDto: CreateWalletDto) {
      return this.walletService.create(createWalletDto);
   }

   @Get()
   @Roles('admin')
   findAll() {
      return this.walletService.findAll();
   }

   @Get(':id')
   @Roles('admin')
   findOne(@Param('id') id: string) {
      return this.walletService.findOne(id);
   }

   @Patch(':id')
   @Roles('admin')
   update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
      return this.walletService.update(id, updateWalletDto);
   }

   @Delete(':id')
   @Roles('admin')
   remove(@Param('id') id: string) {
      return this.walletService.remove(id);
   }
}
