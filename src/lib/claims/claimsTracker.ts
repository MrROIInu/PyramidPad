import { supabase, handleSupabaseError } from '../supabase';
import { TOKEN_PRICES } from '../prices/tokenPrices';
import { PRICE_IMPACT_FACTOR } from '../prices/constants';

interface ClaimStats {
  count: number;
  volume: number;
  lastClaimTime: string;
}

const claimsCache: Record<string, ClaimStats> = {};

export const getClaimsForToken = async (symbol: string): Promise<ClaimStats> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('claimed', true)
      .gte('claimed_at', today.toISOString())
      .or(`from_token.eq.${symbol},to_token.eq.${symbol}`);

    if (error) {
      handleSupabaseError(error);
      return claimsCache[symbol] || { count: 0, volume: 0, lastClaimTime: '' };
    }

    const claims = data || [];
    const volume = claims.reduce((total, order) => {
      if (order.from_token === symbol) {
        return total + order.from_amount;
      } else {
        return total + order.to_amount;
      }
    }, 0);

    const lastClaim = claims[claims.length - 1];
    const stats = {
      count: claims.length,
      volume,
      lastClaimTime: lastClaim?.claimed_at || ''
    };

    claimsCache[symbol] = stats;
    return stats;
  } catch (error) {
    console.warn('Error fetching claims:', error);
    return claimsCache[symbol] || { count: 0, volume: 0, lastClaimTime: '' };
  }
};

export const calculatePriceImpactFromClaims = async (symbol: string): Promise<number> => {
  try {
    const { count } = await getClaimsForToken(symbol);
    const basePrice = TOKEN_PRICES[symbol] || 0;
    
    // Each claim affects price by PRICE_IMPACT_FACTOR
    const totalImpact = count * PRICE_IMPACT_FACTOR;
    return basePrice * (1 + totalImpact);
  } catch (error) {
    console.warn('Error calculating price impact:', error);
    return TOKEN_PRICES[symbol] || 0;
  }
};