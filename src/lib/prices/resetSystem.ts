import { supabase } from '../supabase';
import { TOKENS } from '../../data/tokens';
import { fetchRXDPrice } from '../api/priceApi';
import { BASE_RATIO, MIN_PRICE } from './constants';

export const resetPricingSystem = async () => {
  try {
    // Step 1: Clear existing data
    await supabase.rpc('reset_pricing_system');

    // Step 2: Get current RXD price
    const rxdData = await fetchRXDPrice();
    const rxdPrice = Math.max(rxdData.price, MIN_PRICE);
    const timestamp = new Date().toISOString();

    // Step 3: Initialize RXD token
    const rxdToken = {
      symbol: 'RXD',
      price_usd: rxdPrice,
      market_cap: rxdPrice * 21000000000,
      price_change_24h: 0,
      last_updated: timestamp
    };

    // Step 4: Initialize other tokens at 1:1000 ratio
    const baseTokenPrice = rxdPrice / BASE_RATIO;
    const tokenData = TOKENS.map(token => ({
      symbol: token.symbol,
      price_usd: baseTokenPrice,
      market_cap: baseTokenPrice * token.totalSupply,
      price_change_24h: 0,
      last_updated: timestamp
    }));

    // Step 5: Insert all token data
    await supabase
      .from('tokens')
      .upsert([rxdToken, ...tokenData]);

    // Step 6: Insert initial price history
    await supabase
      .from('token_price_history')
      .insert([rxdToken, ...tokenData].map(token => ({
        symbol: token.symbol,
        price_usd: token.price_usd,
        timestamp
      })));

    return true;
  } catch (error) {
    console.error('Error resetting pricing system:', error);
    return false;
  }
};