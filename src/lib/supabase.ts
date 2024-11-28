import { createClient } from '@supabase/supabase-js';
import { TOKENS } from '../data/tokens';
import { TOKEN_PRICES } from './tokenPrices';

const supabaseUrl = 'https://vmlrhtccpuhttgaszymo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbHJodGNjcHVodHRnYXN6eW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNzI0MjksImV4cCI6MjA0NzY0ODQyOX0.g_oEjsXloQ20YFL3YW1xSbQRe2ZPeF01R4ItclFEYiY';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const initializeDatabase = async () => {
  try {
    // Clear existing trades
    await supabase
      .from('trades')
      .delete()
      .neq('id', 0);

    // Initialize token data
    const tokenData = TOKENS.map(token => ({
      symbol: token.symbol,
      name: token.name,
      total_supply: token.totalSupply,
      contract_address: token.contractAddress,
      price_usd: TOKEN_PRICES[token.symbol] || 0
    }));

    const { error: tokenError } = await supabase
      .from('tokens')
      .upsert(tokenData, { 
        onConflict: 'symbol',
        ignoreDuplicates: false 
      });

    if (tokenError) throw tokenError;

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export const subscribeToUpdates = (callback: () => void) => {
  const ordersSubscription = supabase
    .channel('orders-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .subscribe();

  const tradesSubscription = supabase
    .channel('trades-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, callback)
    .subscribe();

  return () => {
    ordersSubscription.unsubscribe();
    tradesSubscription.unsubscribe();
  };
};