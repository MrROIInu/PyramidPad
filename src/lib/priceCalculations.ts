import { TOKEN_PRICES } from './tokenPrices';

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

  // Get token prices in USD
  const fromPriceUSD = TOKEN_PRICES[fromToken] || 0;
  const toPriceUSD = TOKEN_PRICES[toToken] || 0;

  if (fromPriceUSD === 0 || toPriceUSD === 0) {
    return { deviation: 0, isMarketPrice: true };
  }

  // Calculate market rate (how many toTokens should you get for one fromToken)
  const marketRate = fromPriceUSD / toPriceUSD;
  
  // Calculate actual rate from the input amounts
  const actualRate = toValue / fromValue;
  
  // Calculate deviation percentage
  const deviation = ((actualRate / marketRate) - 1) * 100;
  
  // Consider it market price if deviation is less than 0.1%
  const isMarketPrice = Math.abs(deviation) < 0.1;

  return { deviation, isMarketPrice };
};