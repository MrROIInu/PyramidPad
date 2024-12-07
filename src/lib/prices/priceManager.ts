import { supabase } from '../../supabase';
import { Order } from '../../types';
import { PRICE_IMPACT } from './constants';

export const updatePriceAfterClaim = async (order: Order) => {
  try {
    const timestamp = new Date().toISOString();

    // Update from_token price (decrease by exactly 0.1%)
    if (order.from_token !== 'RXD') {
      const { data: fromToken } = await supabase
        .from('rxd20_token_prices')
        .select('price_usd')
        .eq('symbol', order.from_token)
        .single();

      if (fromToken) {
        const newPrice = fromToken.price_usd * (1 - PRICE_IMPACT);

        await supabase.from('rxd20_token_prices')
          .upsert({
            symbol: order.from_token,
            price_usd: newPrice,
            last_updated: timestamp,
            last_trade_at: timestamp
          });

        // Add price history entry
        await supabase.from('rxd20_price_history')
          .insert({
            symbol: order.from_token,
            price_usd: newPrice,
            timestamp
          });
      }
    }

    // Update to_token price (increase by exactly 0.1%)
    if (order.to_token !== 'RXD') {
      const { data: toToken } = await supabase
        .from('rxd20_token_prices')
        .select('price_usd')
        .eq('symbol', order.to_token)
        .single();

      if (toToken) {
        const newPrice = toToken.price_usd * (1 + PRICE_IMPACT);

        await supabase.from('rxd20_token_prices')
          .upsert({
            symbol: order.to_token,
            price_usd: newPrice,
            last_updated: timestamp,
            last_trade_at: timestamp
          });

        // Add price history entry
        await supabase.from('rxd20_price_history')
          .insert({
            symbol: order.to_token,
            price_usd: newPrice,
            timestamp
          });
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating prices after claim:', error);
    return false;
  }
};

export const validatePriceDeviation = (fromAmount: number, toAmount: number, fromPrice: number, toPrice: number): boolean => {
  if (!fromAmount || !toAmount || !fromPrice || !toPrice) return false;

  // Calculate expected rate based on current prices
  const expectedRate = fromPrice / toPrice;
  const actualRate = fromAmount / toAmount;
  
  // Calculate deviation percentage
  const deviation = Math.abs(((actualRate / expectedRate) - 1));

  // Maximum allowed deviation is 100%
  return deviation <= 1;
};

export const calculatePriceChange = async (symbol: string): Promise<number> => {
  try {
    const { data: stats } = await supabase
      .from('rxd20_market_stats')
      .select('open_price, close_price')
      .eq('symbol', symbol)
      .eq('interval', '24h')
      .single();

    if (!stats || !stats.open_price) return 0;

    return ((stats.close_price - stats.open_price) / stats.open_price) * 100;
  } catch (error) {
    console.error('Error calculating price change:', error);
    return 0;
  }
};