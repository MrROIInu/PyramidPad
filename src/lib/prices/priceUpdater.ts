import { supabase } from '../supabase';
import { TOKEN_PRICES } from './tokenPrices';
import { TOKENS } from '../../data/tokens';
import { calculatePriceImpact } from './priceCalculator';
import { Order } from '../../types';

export const updateTokenPricesAfterClaim = async (order: Order): Promise<void> => {
  const updates = [];
  
  if (order.from_token !== 'RXD') {
    const newPrice = calculatePriceImpact(order.from_token, true);
    TOKEN_PRICES[order.from_token] = newPrice;
    
    const token = TOKENS.find(t => t.symbol === order.from_token);
    if (token) {
      updates.push({
        symbol: order.from_token,
        price_usd: newPrice,
        market_cap: newPrice * token.totalSupply,
        last_updated: new Date().toISOString()
      });
    }
  }
  
  if (order.to_token !== 'RXD') {
    const newPrice = calculatePriceImpact(order.to_token, false);
    TOKEN_PRICES[order.to_token] = newPrice;
    
    const token = TOKENS.find(t => t.symbol === order.to_token);
    if (token) {
      updates.push({
        symbol: order.to_token,
        price_usd: newPrice,
        market_cap: newPrice * token.totalSupply,
        last_updated: new Date().toISOString()
      });
    }
  }

  if (updates.length > 0) {
    await Promise.all([
      supabase.from('tokens').upsert(updates),
      supabase.from('token_price_history').insert(
        updates.map(({ symbol, price_usd, last_updated }) => ({
          symbol,
          price_usd,
          timestamp: last_updated
        }))
      )
    ]);
  }
};