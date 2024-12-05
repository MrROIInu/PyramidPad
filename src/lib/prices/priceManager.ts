import { supabase } from '../supabase';
import { TOKEN_PRICES, setTokenPrice } from './tokenPrices';
import { TOKENS } from '../../data/tokens';
import { Order } from '../../types';
import { PRICE_IMPACT_FACTOR, BASE_RATIO } from './constants';
import { getClaimsForToken } from '../claims/claimsTracker';

export const updatePriceFromClaims = async (symbol: string): Promise<void> => {
  try {
    const { count, volume } = await getClaimsForToken(symbol);
    const basePrice = TOKEN_PRICES[symbol] || 0;
    
    if (basePrice === 0) return;

    // Calculate cumulative impact from claims
    const impactMultiplier = 1 + (count * PRICE_IMPACT_FACTOR);
    // Volume impact: 0.01% per 1000 tokens
    const volumeImpact = (volume / 1000) * 0.0001;
    
    const newPrice = basePrice * (impactMultiplier + volumeImpact);
    setTokenPrice(symbol, newPrice);

    try {
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
    } catch (dbError) {
      console.warn('Error updating price in database:', dbError);
      // Continue execution even if database update fails
    }
  } catch (error) {
    console.warn('Error updating price from claims:', error);
    // Keep existing price on error
  }
};

export const initializePrices = async (): Promise<void> => {
  try {
    // Get RXD price from database
    const { data: rxdData } = await supabase
      .from('tokens')
      .select('price_usd')
      .eq('symbol', 'RXD')
      .single();

    const rxdPrice = rxdData?.price_usd || 0.001202;
    setTokenPrice('RXD', rxdPrice);

    // Initialize other token prices
    for (const token of TOKENS) {
      const basePrice = rxdPrice / BASE_RATIO;
      setTokenPrice(token.symbol, basePrice);
      
      // Update prices based on claims
      await updatePriceFromClaims(token.symbol).catch(error => {
        console.warn(`Error updating price for ${token.symbol}:`, error);
      });
    }
  } catch (error) {
    console.warn('Error initializing prices:', error);
    // Set default prices if initialization fails
    setTokenPrice('RXD', 0.001202);
    TOKENS.forEach(token => {
      setTokenPrice(token.symbol, 0.001202 / BASE_RATIO);
    });
  }
};

let updateInterval: NodeJS.Timeout;

export const startPriceUpdates = (): void => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }

  updateInterval = setInterval(async () => {
    for (const token of TOKENS) {
      await updatePriceFromClaims(token.symbol).catch(error => {
        console.warn(`Error updating price for ${token.symbol}:`, error);
      });
    }
  }, 30000); // Update every 30 seconds
};

export const stopPriceUpdates = (): void => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
};