import { supabase } from '../supabase';
import { TOKENS } from '../../data/tokens';
import { fetchRXDPrice } from '../api/priceApi';

const BASE_RATIO = 1000; // 1:1000 ratio with RXD

export const resetTokenPrices = async () => {
  try {
    // First clear all price history
    await supabase
      .from('token_price_history')
      .delete()
      .neq('symbol', 'RXD');

    // Get current RXD price
    const rxdData = await fetchRXDPrice();
    const rxdPrice = rxdData.price;
    const timestamp = new Date().toISOString();

    // Calculate base price for other tokens (1:1000 ratio with RXD)
    const baseTokenPrice = rxdPrice / BASE_RATIO;

    // Prepare token data
    const tokenData = TOKENS.map(token => ({
      symbol: token.symbol,
      price_usd: baseTokenPrice,
      market_cap: baseTokenPrice * token.totalSupply,
      price_change_24h: 0,
      last_updated: timestamp
    }));

    // Update token prices
    await supabase
      .from('tokens')
      .upsert(tokenData, { onConflict: 'symbol' });

    // Add initial price history entries
    await supabase
      .from('token_price_history')
      .insert(tokenData.map(token => ({
        symbol: token.symbol,
        price_usd: token.price_usd,
        timestamp
      })));

    return true;
  } catch (error) {
    console.error('Error resetting token prices:', error);
    return false;
  }
};