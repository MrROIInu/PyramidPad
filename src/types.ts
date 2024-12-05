export interface Token {
  symbol: string;
  name: string;
  description?: string;
  imageUrl: string;
  totalSupply: number;
  contractAddress: string;
  social?: {
    website?: string;
    x?: string;
    discord?: string;
    telegram?: string;
  };
}

export interface MiningData {
  premintedAmount: number;
  minted: number;
  difficulty: number;
}

export interface Order {
  id: number;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  swap_tx: string;
  claimed: boolean;
  claim_count: number;
  status?: string;
  wallet_address?: string;
  created_at: string;
}

export interface PriceData {
  price: number;
  marketCap: number;
  priceChange24h: number;
}