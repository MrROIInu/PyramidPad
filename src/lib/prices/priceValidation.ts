import { supabase } from '../../supabase';

export const validatePriceDeviation = async (
  fromToken: string,
  toToken: string,
  fromAmount: number,
  toAmount: number
): Promise<{ isValid: boolean; deviation: number }> => {
  try {
    // Get current prices from database
    const { data: prices } = await supabase
      .from('rxd20_token_prices')
      .select('symbol, price_usd')
      .in('symbol', [fromToken, toToken]);

    if (!prices?.length) {
      return { isValid: false, deviation: 0 };
    }

    const fromPrice = prices.find(p => p.symbol === fromToken)?.price_usd || 0;
    const toPrice = prices.find(p => p.symbol === toToken)?.price_usd || 0;

    if (!fromPrice || !toPrice) {
      return { isValid: false, deviation: 0 };
    }

    // Calculate expected rate based on current prices
    const expectedRate = fromPrice / toPrice;
    const actualRate = fromAmount / toAmount;
    
    // Calculate deviation percentage
    const deviation = Math.abs(((actualRate / expectedRate) - 1) * 100);

    // Maximum allowed deviation is 300%
    const isValid = deviation <= 300;

    return { isValid, deviation };
  } catch (error) {
    console.error('Error validating price deviation:', error);
    return { isValid: false, deviation: 0 };
  }
};