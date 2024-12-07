import { supabase } from '../../supabase';
import { TOKENS } from '../../data/tokens';
import { RXD_TOKEN } from '../../constants/tokens';
import { fetchCGData } from '../api/coingecko';

export const initializeDatabase = async () => {
  try {
    // Get RXD price from CoinGecko
    const rxdData = await fetchCGData();
    const basePrice = rxdData.price || 0.001202;
    const tokenPrice = basePrice / 1000; // Base price for other tokens

    // Prepare token data
    const tokenData = [
      // RXD token
      {
        symbol: RXD_TOKEN.symbol,
        price_usd: basePrice,
        price_change_24h: rxdData.priceChange24h || 0,
        volume_24h: 0,
        last_trade_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      },
      // Other tokens
      ...TOKENS.map(token => ({
        symbol: token.symbol,
        price_usd: tokenPrice,
        price_change_24h: 0,
        volume_24h: 0,
        last_trade_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      }))
    ];

    // Insert initial token prices
    const { error: pricesError } = await supabase
      .from('rxd20_token_prices')
      .upsert(tokenData, { 
        onConflict: 'symbol',
        ignoreDuplicates: false 
      });

    if (pricesError) throw pricesError;

    // Insert initial price history
    const historyData = tokenData.map(token => ({
      symbol: token.symbol,
      price_usd: token.price_usd,
      timestamp: token.last_updated
    }));

    const { error: historyError } = await supabase
      .from('rxd20_price_history')
      .insert(historyData);

    if (historyError) throw historyError;

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};