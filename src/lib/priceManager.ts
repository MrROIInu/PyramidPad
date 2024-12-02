import { supabase } from './supabase';
import { TOKEN_PRICES } from './tokenPrices';
import { Order } from '../types';

const PRICE_IMPACT_FACTOR = 0.001; // 0.1% price impact per order

export async function updateTokenPriceAfterClaim(order: Order) {
  try {
    const { from_token, to_token, from_amount, to_amount } = order;
    
    // Calculate price impact based on order size
    const fromTokenImpact = (from_amount / to_amount) * PRICE_IMPACT_FACTOR;
    const toTokenImpact = (to_amount / from_amount) * PRICE_IMPACT_FACTOR;

    // Update prices in memory
    if (from_token !== 'RXD') {
      TOKEN_PRICES[from_token] *= (1 - fromTokenImpact);
    }
    if (to_token !== 'RXD') {
      TOKEN_PRICES[to_token] *= (1 + toTokenImpact);
    }

    // Update prices in database
    const updates = [];
    if (from_token !== 'RXD') {
      updates.push({
        symbol: from_token,
        price_usd: TOKEN_PRICES[from_token]
      });
    }
    if (to_token !== 'RXD') {
      updates.push({
        symbol: to_token,
        price_usd: TOKEN_PRICES[to_token]
      });
    }

    if (updates.length > 0) {
      const { error } = await supabase
        .from('tokens')
        .upsert(updates);

      if (error) throw error;
    }

    return { ...TOKEN_PRICES };
  } catch (error) {
    console.warn('Error updating token prices:', error);
    return { ...TOKEN_PRICES };
  }
}