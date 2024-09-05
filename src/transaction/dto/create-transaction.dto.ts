export class CreateTransactionDto {
  walletAddress: string;
  quantity: number;
  chain: string;
  chargeType: string;
  amount: number;
  status?: string;
  userId: string;
}
