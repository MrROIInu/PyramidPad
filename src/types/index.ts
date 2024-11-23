export interface Order {
  id: string;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  swap_tx: string;
  claimed: boolean;
  claim_count: number;
  created_at?: string;
}