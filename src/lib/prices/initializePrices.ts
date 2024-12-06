import { supabase } from '../supabase';
import { TOKENS } from '../../data/tokens';
import { fetchRXDPrice } from '../api/priceApi';

const BASE_RATIO = 1000; // Base ratio between RXD and other tokens
const MIN_PRICE = 0.000001; // Minimum allowed price

export const initializeTokenPrices = async () => {
  try {
    // First get RXD price
    const rxdData = await fetchRXDPrice();
    const rxdPrice = Math.max(rxdData.price, MIN_PRICE);

    // Prepare token data for all tokens including RXD
    const tokenData = [
      // RXD token
      {
        symbol: 'RXD',
        price_usd: rxdPrice,
        market_cap: rxdPrice * 21000000000,
        price_change_24h: rxdData.priceChange24h,
        last_updated: new Date().toISOString()
      },
      // Other tokens
      ...TOKENS.map(token => {
        const tokenPrice = Math.max(rxdPrice / BASE_RATIO, MIN_PRICE);
        return {
          symbol: token.symbol,
          price_usd: tokenPrice,
          market_cap: tokenPrice * token.totalSupply,
          price_change_24h: 0,
          last_updated: new Date().toISOString()
        };
      })
    ];

    // Update or insert token prices
    const { error } = await supabase
      .from('tokens')
      .upsert(tokenData, { onConflict: 'symbol' });

    if (error) {
      throw error;
    }

    // Also insert initial price history
    const historyData = tokenData.map(token => ({
      symbol: token.symbol,
      price_usd: token.price_usd,
      timestamp: token.last_updated
    }));

    await supabase
      .from('token_price_history')
      .insert(historyData);

    // Return the initialized prices
    return tokenData.reduce((acc, token) => ({
      ...acc,
      [token.symbol]: token.price_usd
    }), {});
  } catch (error) {
    console.error('Error initializing token prices:', error);
    // Return default minimum prices if initialization fails
    return {
      RXD: MIN_PRICE,
      ...TOKENS.reduce((acc, token) => ({
        ...acc,
        [token.symbol]: MIN_PRICE
      }), {})
    };
  }
};