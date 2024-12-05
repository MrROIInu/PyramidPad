import { supabase } from '../supabase';
import { TOKEN_PRICES } from '../prices/tokenPrices';

interface ClaimEffect {
  symbol: string;
  priceImpact: number;
  timestamp: string;
}

const CLAIM_EFFECTS: ClaimEffect[] = [];
const PRICE_IMPACT_FACTOR = 0.001; // 0.1% per claim
const FALLBACK_CHANGE = 0.5; // 0.5% fallback change when data can't be fetched

export const getRecentClaims = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('claimed', true)
      .gte('claimed_at', threeDaysAgo.toISOString())
      .order('claimed_at', { ascending: false });

    if (error) {
      console.warn('Error fetching recent claims:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Network error fetching claims:', error);
    return [];
  }
};

export const updatePriceFromRecentClaims = async (symbol: string) => {
  try {
    const claims = await getRecentClaims();
    const tokenClaims = claims.filter(claim => 
      claim.from_token === symbol || claim.to_token === symbol
    );

    let cumulativeImpact = 0;

    tokenClaims.forEach(claim => {
      const isFromToken = claim.from_token === symbol;
      const impact = isFromToken ? -PRICE_IMPACT_FACTOR : PRICE_IMPACT_FACTOR;
      cumulativeImpact += impact;

      CLAIM_EFFECTS.push({
        symbol,
        priceImpact: impact,
        timestamp: claim.claimed_at
      });
    });

    // Keep only last 3 days of effects
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    while (CLAIM_EFFECTS.length > 0 && 
           new Date(CLAIM_EFFECTS[0].timestamp) < threeDaysAgo) {
      CLAIM_EFFECTS.shift();
    }

    return cumulativeImpact || FALLBACK_CHANGE * (Math.random() > 0.5 ? 1 : -1);
  } catch (error) {
    console.warn('Error updating price from claims:', error);
    return FALLBACK_CHANGE * (Math.random() > 0.5 ? 1 : -1);
  }
};

export const getPriceChangePercentage = (symbol: string, period: '1d' | '7d'): number => {
  try {
    const effects = CLAIM_EFFECTS.filter(effect => effect.symbol === symbol);
    const periodDate = new Date();
    
    if (period === '1d') {
      periodDate.setDate(periodDate.getDate() - 1);
    } else {
      periodDate.setDate(periodDate.getDate() - 7);
    }

    const periodEffects = effects.filter(effect => 
      new Date(effect.timestamp) >= periodDate
    );

    const cumulativeImpact = periodEffects.reduce((sum, effect) => 
      sum + effect.priceImpact, 0
    );

    const basePrice = TOKEN_PRICES[symbol] || 0;
    return basePrice ? (cumulativeImpact / basePrice) * 100 : FALLBACK_CHANGE;
  } catch (error) {
    console.warn('Error calculating price change:', error);
    return FALLBACK_CHANGE * (Math.random() > 0.5 ? 1 : -1);
  }
};