import { supabase } from '../supabase';
import { TOKENS } from '../../data/tokens';
import { Order } from '../../types';

const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order
const CLAIM_IMPACT_MULTIPLIER = 1.5; // 50% more impact for claims

export const updatePriceAfterClaim = async (order: Order) => {
  try {
    const timestamp = new Date().toISOString();
    const updates = [];

    // Update from_token price (decrease)
    if (order.from_token !== 'RXD') {
      const { data: fromToken } = await supabase
        .from('tokens')
        .select('price_usd')
        .eq('symbol', order.from_token)
        .single();

      if (fromToken) {
        const newPrice = fromToken.price_usd * (1 - (PRICE_IMPACT_FACTOR * CLAIM_IMPACT_MULTIPLIER));
        const token = TOKENS.find(t => t.symbol === order.from_token);
        
        updates.push({
          symbol: order.from_token,
          price_usd: newPrice,
          market_cap: newPrice * (token?.totalSupply || 0),
          last_updated: timestamp
        });
      }
    }

    // Update to_token price (increase)
    if (order.to_token !== 'RXD') {
      const { data: toToken } = await supabase
        .from('tokens')
        .select('price_usd')
        .eq('symbol', order.to_token)
        .single();

      if (toToken) {
        const newPrice = toToken.price_usd * (1 + (PRICE_IMPACT_FACTOR * CLAIM_IMPACT_MULTIPLIER));
        const token = TOKENS.find(t => t.symbol === order.to_token);
        
        updates.push({
          symbol: order.to_token,
          price_usd: newPrice,
          market_cap: newPrice * (token?.totalSupply || 0),
          last_updated: timestamp
        });
      }
    }

    if (updates.length > 0) {
      // Update current prices
      const { error: updateError } = await supabase
        .from('tokens')
        .upsert(updates, { onConflict: 'symbol' });

      if (updateError) throw updateError;

      // Add to price history
      const historyData = updates.map(update => ({
        symbol: update.symbol,
        price_usd: update.price_usd,
        timestamp: update.last_updated
      }));

      await supabase
        .from('token_price_history')
        .insert(historyData);
    }

    return true;
  } catch (error) {
    console.error('Error updating prices after claim:', error);
    return false;
  }
};

export const calculatePriceChange = async (symbol: string) => {
  try {
    const { data: history } = await supabase
      .from('token_price_history')
      .select('price_usd, timestamp')
      .eq('symbol', symbol)
      .order('timestamp', { ascending: false })
      .limit(24);

    if (!history?.length) return 0;

    const latestPrice = history[0].price_usd;
    const oldestPrice = history[history.length - 1].price_usd;

    if (!oldestPrice) return 0;
    return ((latestPrice - oldestPrice) / oldestPrice) * 100;
  } catch (error) {
    console.error('Error calculating price change:', error);
    return 0;
  }
};