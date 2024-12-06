import { supabase } from '../supabase';
import { TOKENS } from '../../data/tokens';
import { fetchRXDPrice } from '../api/priceApi';

export const initializeDatabase = async () => {
  try {
    // Create tables directly using supabase query
    const { error: createError } = await supabase.from('rxd20_token_prices').select('*').limit(1);
    
    // If table doesn't exist, create all tables
    if (createError?.code === 'PGRST116') {
      const { error: tableError } = await supabase.rpc('create_rxd20_tables');
      if (tableError) throw tableError;
    }

    // Initialize token prices
    const rxdPrice = await fetchRXDPrice();
    const basePrice = rxdPrice.price / 1000; // Base price for other tokens

    // Prepare token data
    const tokenData = TOKENS.map(token => ({
      symbol: token.symbol,
      price_usd: basePrice,
      market_cap: basePrice * token.totalSupply,
      volume_24h: 0,
      price_change_24h: 0,
      price_change_7d: 0,
      last_trade_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    }));

    // Add RXD token
    tokenData.push({
      symbol: 'RXD',
      price_usd: rxdPrice.price,
      market_cap: rxdPrice.marketCap,
      volume_24h: 0,
      price_change_24h: rxdPrice.priceChange24h,
      price_change_7d: 0,
      last_trade_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    });

    // Insert initial token prices
    const { error: insertError } = await supabase
      .from('rxd20_token_prices')
      .upsert(tokenData);

    if (insertError) throw insertError;

    // Insert initial price history
    const { error: historyError } = await supabase
      .from('rxd20_price_history')
      .insert(tokenData.map(token => ({
        symbol: token.symbol,
        price_usd: token.price_usd,
        market_cap: token.market_cap,
        volume: 0,
        timestamp: token.last_updated
      })));

    if (historyError) throw historyError;

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};