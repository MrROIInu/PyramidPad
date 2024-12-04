import { PRICE_IMPACT_FACTOR } from './constants';
import { TOKEN_PRICES } from './tokenPrices';

export const calculatePriceImpact = (
  tokenSymbol: string,
  isFromToken: boolean
): number => {
  const currentPrice = TOKEN_PRICES[tokenSymbol] || 0;
  const impactMultiplier = isFromToken ? (1 - PRICE_IMPACT_FACTOR) : (1 + PRICE_IMPACT_FACTOR);
  return currentPrice * impactMultiplier;
};

export const calculateMarketRate = (
  fromToken: string,
  toToken: string
): number => {
  const fromPrice = TOKEN_PRICES[fromToken] || 0;
  const toPrice = TOKEN_PRICES[toToken] || 0;
  
  if (fromPrice === 0 || toPrice === 0) return 0;
  return fromPrice / toPrice;
};

export const calculatePriceDeviation = (
  fromToken: string,
  toToken: string,
  fromAmount: string,
  toAmount: string
): { deviation: number; isMarketPrice: boolean } => {
  const fromValue = parseFloat(fromAmount);
  const toValue = parseFloat(toAmount);

  if (!fromValue || !toValue || fromValue <= 0 || toValue <= 0) {
    return { deviation: 0, isMarketPrice: true };
  }

  const marketRate = calculateMarketRate(fromToken, toToken);
  if (marketRate === 0) {
    return { deviation: 0, isMarketPrice: true };
  }

  const actualRate = toValue / fromValue;
  const deviation = ((actualRate / marketRate) - 1) * 100;
  const isMarketPrice = Math.abs(deviation) < 0.1;

  return { deviation, isMarketPrice };
};