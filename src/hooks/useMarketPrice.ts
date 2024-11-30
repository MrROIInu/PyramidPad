import { useMemo } from 'react';
import { TOKEN_PRICES } from '../lib/tokenPrices';

export const useMarketPrice = (
  fromToken: string,
  toToken: string,
  fromAmount: string,
  toAmount: string
) => {
  return useMemo(() => {
    if (!fromAmount || !toAmount) {
      return {
        marketPrice: 1000,
        deviation: 0,
        isMarketPrice: true,
        deviationClass: ''
      };
    }

    const fromValue = parseInt(fromAmount);
    const toValue = parseInt(toAmount);
    
    if (isNaN(fromValue) || isNaN(toValue) || fromValue === 0) {
      return {
        marketPrice: 1000,
        deviation: 0,
        isMarketPrice: true,
        deviationClass: ''
      };
    }

    // Calculate market price based on direction
    const marketPrice = fromToken === 'RXD' ? 1000 : 1/1000;
    const currentPrice = fromToken === 'RXD' ? toValue / fromValue : fromValue / toValue;
    
    // Calculate deviation percentage
    const deviation = ((currentPrice - marketPrice) / marketPrice) * 100;
    
    // Determine deviation class for styling
    let deviationClass = '';
    if (Math.abs(deviation) >= 10) {
      deviationClass = 'text-red-500 font-bold';
    } else if (Math.abs(deviation) > 0) {
      deviationClass = deviation > 0 ? 'text-yellow-500' : 'text-yellow-600';
    }

    return {
      marketPrice,
      deviation,
      isMarketPrice: Math.abs(deviation) < 0.1,
      deviationClass
    };
  }, [fromToken, toToken, fromAmount, toAmount]);
};