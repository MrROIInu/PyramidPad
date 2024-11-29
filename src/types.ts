export interface Token {
  symbol: string;
  name: string;
  imageUrl: string;
  totalSupply: number;
  contractAddress?: string;
  social?: {
    website?: string;
    x?: string;
    discord?: string;
    telegram?: string;
  };
}

export interface Order {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  swap_tx: string;
  claimed: boolean;
  created_at: string;
  claim_count: number;
  status?: string;
}

export interface MiningData {
  mined: number;
  difficulty: number;
}