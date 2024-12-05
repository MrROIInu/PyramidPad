import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import { TOKENS } from '../data/tokens';
import { updatePriceFromRecentClaims, getPriceChangePercentage } from '../lib/claims/recentClaims';

interface PriceHistory {
  [key: string]: number[];
}

interface PriceChanges {
  [key: string]: number;
}

export const usePriceHistory = () => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory>({});
  const [priceChanges, setPriceChanges] = useState<PriceChanges>({});

  useEffect(() => {
    const updatePrices = async () => {
      const changes: PriceChanges = {};

      for (const token of TOKENS) {
        const impact = await updatePriceFromRecentClaims(token.symbol);
        const change = getPriceChangePercentage(token.symbol, '7d');
        changes[token.symbol] = change;

        // Update price history
        setPriceHistory(prev => ({
          ...prev,
          [token.symbol]: [...(prev[token.symbol] || []), TOKEN_PRICES[token.symbol] || 0]
        }));
      }

      setPriceChanges(changes);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000);

    return () => clearInterval(interval);
  }, []);

  return { priceHistory, priceChanges };
};