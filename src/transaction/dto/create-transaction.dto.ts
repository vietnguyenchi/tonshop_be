export class CreateTransactionDto {
  walletAddress: string;
  quantity: number;
  chain: string;
  chargeType: string;
  status?: string;
  userId: string;
  transactionFee: number;
  exchangeRate: number;
  requestId: string;
}
