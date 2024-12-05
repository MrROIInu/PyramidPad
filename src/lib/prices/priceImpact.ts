import { TOKEN_PRICES } from './tokenPrices';

const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order

export const calculatePriceImpact = (
  symbol: string,
  isSell: boolean,
  amount: number
): number => {
  const currentPrice = TOKEN_PRICES[symbol] || 0;
  if (currentPrice === 0) return 0;

  // Larger amounts have more impact
  const volumeImpact = (amount / 1000000) * PRICE_IMPACT_FACTOR;
  const impact = PRICE_IMPACT_FACTOR + volumeImpact;
  
  return isSell ? 
    currentPrice * (1 - impact) : 
    currentPrice * (1 + impact);
};