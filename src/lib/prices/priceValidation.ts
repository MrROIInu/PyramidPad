import { TOKEN_PRICES } from './tokenPrices';

export const validatePriceDeviation = (
  fromToken: string,
  toToken: string,
  fromAmount: number,
  toAmount: number
): { isValid: boolean; deviation: number } => {
  const MAX_DEVIATION = 300; // 300%
  
  const fromPrice = TOKEN_PRICES[fromToken] || 0;
  const toPrice = TOKEN_PRICES[toToken] || 0;

  if (!fromPrice || !toPrice || !fromAmount || !toAmount) {
    return { isValid: false, deviation: 0 };
  }

  // Calculate market rate (how many toTokens should you get for one fromToken)
  const marketRate = fromPrice / toPrice;
  const expectedToAmount = fromAmount * marketRate;
  
  // Calculate deviation percentage
  const deviation = ((toAmount - expectedToAmount) / expectedToAmount) * 100;
  
  // Check if deviation is within acceptable range
  const isValid = Math.abs(deviation) <= MAX_DEVIATION;

  return { isValid, deviation };
};