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

@Controller('wallet')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
   constructor(private readonly walletService: WalletService) {}

   @Post()
   create(@Body() createWalletDto: CreateWalletDto) {
      return this.walletService.create(createWalletDto);
   }

   @Get()
   findAll() {
      return this.walletService.findAll();
   }

   @Get(':id')
   findOne(@Param('id') id: string) {
      return this.walletService.findOne(id);
   }

   @Patch(':id')
   update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
      return this.walletService.update(id, updateWalletDto);
   }

   @Delete(':id')
   remove(@Param('id') id: string) {
      return this.walletService.remove(id);
   }
}
