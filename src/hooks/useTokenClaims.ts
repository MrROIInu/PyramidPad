import { useState, useEffect } from 'react';
import { getClaimsForToken, calculatePriceImpactFromClaims } from '../lib/claims/claimsTracker';
import { analyzeTokenActivity } from '../lib/claims/claimsAnalyzer';
import { TOKEN_PRICES } from '../lib/prices/tokenPrices';

export const useTokenClaims = (symbol: string) => {
  const [claimStats, setClaimStats] = useState({ count: 0, volume: 0, lastClaimTime: '' });
  const [activity, setActivity] = useState({ buys: 0, sells: 0, netVolume: 0, priceChange: 0 });
  const [adjustedPrice, setAdjustedPrice] = useState(TOKEN_PRICES[symbol] || 0);

  useEffect(() => {
    const updateStats = async () => {
      const [stats, tokenActivity, newPrice] = await Promise.all([
        getClaimsForToken(symbol),
        analyzeTokenActivity(symbol),
        calculatePriceImpactFromClaims(symbol)
      ]);

      setClaimStats(stats);
      setActivity(tokenActivity);
      setAdjustedPrice(newPrice);
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  return {
    claimStats,
    activity,
    adjustedPrice
  };
};