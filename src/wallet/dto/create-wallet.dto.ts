import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
   @IsString()
   @IsNotEmpty()
   name: string;

   @IsString()
   @IsNotEmpty()
   privateKey: string;

   @IsString()
   status: string;
}
