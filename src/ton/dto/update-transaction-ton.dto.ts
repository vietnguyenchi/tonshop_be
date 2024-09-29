import { StatusTon } from '@prisma/client';

export class UpdateTransactionTonDto {
   lt: string;
   hash: string;
   quantity: number;
   status: StatusTon;
}
