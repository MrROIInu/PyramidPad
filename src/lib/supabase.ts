import { createClient } from '@supabase/supabase-js';
import { TOKENS } from '../data/tokens';
import { calculateGlyphTokenUsdPrice, calculateMarketCap } from './tokenPrices';
import { getMiningData } from './tokenData';

const supabaseUrl = 'https://vmlrhtccpuhttgaszymo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbHJodGNjcHVodHRnYXN6eW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNzI0MjksImV4cCI6MjA0NzY0ODQyOX0.g_oEjsXloQ20YFL3YW1xSbQRe2ZPeF01R4ItclFEYiY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

export const initializeDatabase = async () => {
  try {
    // Initialize orders table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_tables');
    if (createError) throw createError;

    // Initialize token data
    const tokenData = TOKENS.map(token => {
      const miningData = getMiningData(token.symbol);
      const price = token.symbol === 'RXD' ? RXD_PRICE_USD : calculateGlyphTokenUsdPrice();
      const marketCap = calculateMarketCap(token.totalSupply);

      return {
        symbol: token.symbol,
        name: token.name,
        total_supply: token.totalSupply,
        contract_address: token.contractAddress || '94fddcbf9cb28c1d732f725e6b10a5403f7a1d3ca335785154b9ab00689de66f00000000',
        price_usd: price,
        market_cap: marketCap,
        volume_24h: 0,
        price_change_7d: 0,
        preminted: 0,
        minted: miningData.mined,
        open_orders: 0
      };
    });

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