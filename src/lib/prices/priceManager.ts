import { supabase } from '../supabase';
import { TOKENS } from '../../data/tokens';
import { Order } from '../../types';

const PRICE_IMPACT_FACTOR = 0.001; // Exactly 0.1% price impact per order
const MAX_PRICE_CHANGE = 1; // Maximum 100% price change allowed

export const updatePriceAfterClaim = async (order: Order) => {
  try {
    const timestamp = new Date().toISOString();
    const updates = [];

    // Get current prices
    const { data: currentPrices } = await supabase
      .from('tokens')
      .select('symbol, price_usd')
      .in('symbol', [order.from_token, order.to_token]);

    if (!currentPrices?.length) return false;

    // Update from_token price (decrease by exactly 0.1%)
    if (order.from_token !== 'RXD') {
      const fromToken = currentPrices.find(t => t.symbol === order.from_token);
      if (fromToken) {
        const newPrice = fromToken.price_usd * (1 - PRICE_IMPACT_FACTOR);
        const token = TOKENS.find(t => t.symbol === order.from_token);
        
        updates.push({
          symbol: order.from_token,
          price_usd: newPrice,
          market_cap: newPrice * (token?.totalSupply || 0),
          last_updated: timestamp
        });
      }
    }

    // Update to_token price (increase by exactly 0.1%)
    if (order.to_token !== 'RXD') {
      const toToken = currentPrices.find(t => t.symbol === order.to_token);
      if (toToken) {
        const newPrice = toToken.price_usd * (1 + PRICE_IMPACT_FACTOR);
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
      await supabase
        .from('tokens')
        .upsert(updates);

      // Add to price history
      await supabase
        .from('token_price_history')
        .insert(updates.map(update => ({
          symbol: update.symbol,
          price_usd: update.price_usd,
          timestamp: update.last_updated
        })));
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
  const deviation = Math.abs(((actualRate / expectedRate) - 1) * 100);

  // Maximum allowed deviation is 100%
  return deviation <= MAX_PRICE_CHANGE * 100;
};

export const calculatePriceChange = async (symbol: string): Promise<number> => {
  try {
    const { data: history } = await supabase
      .from('token_price_history')
      .select('price_usd, timestamp')
      .eq('symbol', symbol)
      .order('timestamp', { ascending: false })
      .limit(2);

    if (!history || history.length < 2) return 0;

    const [current, previous] = history;
    return ((current.price_usd - previous.price_usd) / previous.price_usd) * 100;
  } catch (error) {
    console.error('Error calculating price change:', error);
    return 0;
  }
};