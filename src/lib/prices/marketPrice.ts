import { TOKEN_PRICES } from './tokenPrices';

export const calculateMarketDeviation = (
  fromToken: string,
  toToken: string,
  fromAmount: number,
  toAmount: number
): { deviation: number; status: 'above' | 'below' | 'equal' } => {
  const fromPrice = TOKEN_PRICES[fromToken] || 0;
  const toPrice = TOKEN_PRICES[toToken] || 0;

  if (!fromPrice || !toPrice || !fromAmount || !toAmount) {
    return { deviation: 0, status: 'equal' };
  }

  // Calculate market rate (how many toTokens should you get for one fromToken)
  const marketRate = fromPrice / toPrice;
  const expectedToAmount = fromAmount * marketRate;
  
  // Calculate deviation percentage
  const deviation = ((toAmount - expectedToAmount) / expectedToAmount) * 100;
  
  // Determine status
  let status: 'above' | 'below' | 'equal' = 'equal';
  if (Math.abs(deviation) < 0.1) {
    status = 'equal';
  } else if (deviation > 0) {
    status = 'above';
  } else {
    status = 'below';
  }

  return { 
    deviation: Math.abs(deviation), 
    status 
  };
};