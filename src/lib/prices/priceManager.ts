import { supabase } from '../supabase';
import { TOKEN_PRICES, setTokenPrice } from './tokenPrices';
import { TOKENS } from '../../data/tokens';
import { Order } from '../../types';
import { PRICE_IMPACT_FACTOR, BASE_RATIO } from './constants';
import { getClaimsForToken } from '../claims/claimsTracker';

export const updatePriceFromClaims = async (symbol: string): Promise<void> => {
  const { count } = await getClaimsForToken(symbol);
  const basePrice = TOKEN_PRICES[symbol] || 0;
  
  if (basePrice === 0 || count === 0) return;

  // Calculate cumulative impact from claims
  const impactMultiplier = 1 + (count * PRICE_IMPACT_FACTOR);
  const newPrice = basePrice * impactMultiplier;
  setTokenPrice(symbol, newPrice);

  // Update database
  await Promise.all([
    supabase.from('tokens').upsert({
      symbol,
      price_usd: newPrice,
      last_updated: new Date().toISOString()
    }),
    supabase.from('token_price_history').insert({
      symbol,
      price_usd: newPrice,
      timestamp: new Date().toISOString()
    })
  ]);
};

export const initializePrices = async (): Promise<void> => {
  // Get RXD price from database
  const { data: rxdData } = await supabase
    .from('tokens')
    .select('price_usd')
    .eq('symbol', 'RXD')
    .single();

  const rxdPrice = rxdData?.price_usd || 0.001202;
  setTokenPrice('RXD', rxdPrice);

  // Initialize other token prices with 1:1000 ratio
  for (const token of TOKENS) {
    const basePrice = rxdPrice / BASE_RATIO;
    setTokenPrice(token.symbol, basePrice);
  }

  // Reset price history
  await supabase
    .from('token_price_history')
    .delete()
    .neq('symbol', 'RXD');

  // Insert initial price history points
  const initialHistory = TOKENS.map(token => ({
    symbol: token.symbol,
    price_usd: rxdPrice / BASE_RATIO,
    timestamp: new Date().toISOString()
  }));

  await supabase
    .from('token_price_history')
    .insert(initialHistory);
};

let updateInterval: NodeJS.Timeout;

export const startPriceUpdates = (): void => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  updateInterval = setInterval(async () => {
    for (const token of TOKENS) {
      await updatePriceFromClaims(token.symbol);
    }
  }, 30000); // Update every 30 seconds
};

export const stopPriceUpdates = (): void => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
};