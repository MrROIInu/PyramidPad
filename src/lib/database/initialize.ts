import { supabase } from '../../supabase';
import { TOKENS } from '../../data/tokens';
import { RXD_TOKEN } from '../../constants/tokens';
import { fetchCGData } from '../api/coingecko';

const createTables = async () => {
  const { error } = await supabase.rpc('create_tables', {
    sql: `
      -- Create token prices table
      CREATE TABLE IF NOT EXISTS public.rxd20_token_prices (
        symbol TEXT PRIMARY KEY,
        price_usd NUMERIC NOT NULL DEFAULT 0,
        price_change_24h NUMERIC DEFAULT 0,
        volume_24h NUMERIC DEFAULT 0,
        last_trade_at TIMESTAMPTZ DEFAULT now(),
        last_updated TIMESTAMPTZ DEFAULT now()
      );

      -- Create price history table
      CREATE TABLE IF NOT EXISTS public.rxd20_price_history (
        id BIGSERIAL PRIMARY KEY,
        symbol TEXT NOT NULL,
        price_usd NUMERIC NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT now()
      );

      -- Create orders table
      CREATE TABLE IF NOT EXISTS public.orders (
        id BIGSERIAL PRIMARY KEY,
        from_token TEXT NOT NULL,
        to_token TEXT NOT NULL,
        from_amount NUMERIC NOT NULL,
        to_amount NUMERIC NOT NULL,
        swap_tx TEXT NOT NULL,
        claimed BOOLEAN DEFAULT false,
        claim_count INTEGER DEFAULT 0,
        wallet_address TEXT,
        claimed_by TEXT,
        claimed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      -- Enable RLS
      ALTER TABLE public.rxd20_token_prices ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.rxd20_price_history ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Enable read access for all users" ON public.rxd20_token_prices
        FOR SELECT TO authenticated, anon USING (true);

      CREATE POLICY "Enable write access for all users" ON public.rxd20_token_prices
        FOR INSERT TO authenticated, anon WITH CHECK (true);

      CREATE POLICY "Enable update for all users" ON public.rxd20_token_prices
        FOR UPDATE TO authenticated, anon USING (true);

      CREATE POLICY "Enable read access for all users" ON public.rxd20_price_history
        FOR SELECT TO authenticated, anon USING (true);

      CREATE POLICY "Enable write access for all users" ON public.rxd20_price_history
        FOR INSERT TO authenticated, anon WITH CHECK (true);

      CREATE POLICY "Enable read access for all users" ON public.orders
        FOR SELECT TO authenticated, anon USING (true);

      CREATE POLICY "Enable write access for all users" ON public.orders
        FOR INSERT TO authenticated, anon WITH CHECK (true);

      CREATE POLICY "Enable update for all users" ON public.orders
        FOR UPDATE TO authenticated, anon USING (true);
    `
  });

  if (error) throw error;
};

export const initializeDatabase = async () => {
  try {
    // Create tables first
    await createTables();

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