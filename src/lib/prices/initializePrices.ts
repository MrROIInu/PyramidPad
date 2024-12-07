import { supabase } from '../../supabase';
import { TOKENS } from '../../data/tokens';
import { RXD_TOKEN } from '../../constants/tokens';
import { fetchCGData } from '../api/coingecko';

const BASE_RATIO = 1000; // 1 RXD = 1000 other tokens
const MIN_PRICE = 0.000001;

export const initializeTokenPrices = async () => {
  try {
    // Get RXD price from CoinGecko
    const rxdData = await fetchCGData();
    const rxdPrice = Math.max(rxdData.price, MIN_PRICE);
    const timestamp = new Date().toISOString();

    // Calculate base price for other tokens
    const baseTokenPrice = rxdPrice / BASE_RATIO;

    // Prepare token data
    const tokenData = [
      // RXD token
      {
        symbol: RXD_TOKEN.symbol,
        price_usd: rxdPrice,
        price_change_24h: rxdData.priceChange24h,
        volume_24h: 0,
        last_trade_at: timestamp,
        last_updated: timestamp
      },
      // Other tokens
      ...TOKENS.map(token => ({
        symbol: token.symbol,
        price_usd: baseTokenPrice,
        price_change_24h: 0,
        volume_24h: 0,
        last_trade_at: timestamp,
        last_updated: timestamp
      }))
    ];

    // Update or insert token prices
    const { error: pricesError } = await supabase
      .from('rxd20_token_prices')
      .upsert(tokenData, {
        onConflict: 'symbol',
        ignoreDuplicates: false
      });

    if (pricesError) throw pricesError;

    // Add price history entries
    const historyData = tokenData.map(token => ({
      symbol: token.symbol,
      price_usd: token.price_usd,
      timestamp
    }));

    const { error: historyError } = await supabase
      .from('rxd20_price_history')
      .insert(historyData);

    if (historyError) throw historyError;

    // Return initialized prices
    return tokenData.reduce((acc, token) => ({
      ...acc,
      [token.symbol]: token.price_usd
    }), {});
  } catch (error) {
    console.error('Error initializing token prices:', error);
    return {
      RXD: MIN_PRICE,
      ...TOKENS.reduce((acc, token) => ({
        ...acc,
        [token.symbol]: MIN_PRICE / BASE_RATIO
      }), {})
    };
  }
};