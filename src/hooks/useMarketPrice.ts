import { useMemo } from 'react';
import { calculatePriceDeviation } from '../lib/priceCalculations';

export const useMarketPrice = (
  fromToken: string,
  toToken: string,
  fromAmount: string,
  toAmount: string
) => {
  return useMemo(() => {
    const { deviation, isMarketPrice } = calculatePriceDeviation(
      fromToken,
      toToken,
      fromAmount,
      toAmount
    );

    // Determine deviation class for styling
    let deviationClass = '';
    if (Math.abs(deviation) >= 10) {
      deviationClass = 'text-red-500 font-bold';
    } else if (Math.abs(deviation) > 0) {
      deviationClass = deviation > 0 ? 'text-green-500' : 'text-red-500';
    }

    return {
      deviation,
      isMarketPrice,
      deviationClass
    };
  }, [fromToken, toToken, fromAmount, toAmount]);
};