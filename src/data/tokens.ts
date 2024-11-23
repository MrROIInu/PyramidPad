export interface Token {
  id: string;
  name: string;
  symbol: string;
  totalSupply: number;
}

export const TOKENS: Token[] = [
  {
    id: '1',
    name: 'Radiant',
    symbol: 'RXD',
    totalSupply: 21000000
  },
  {
    id: '2',
    name: 'Power',
    symbol: 'POW',
    totalSupply: 21000000
  }
];