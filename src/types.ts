export interface Order {
  id: number;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  swapTx: string;
  claimed: boolean;
  created_at: string;
  claim_count: number;
}