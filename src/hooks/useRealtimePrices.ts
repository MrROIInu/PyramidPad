import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import { updatePriceFromRecentClaims } from '../lib/claims/recentClaims';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);

  useEffect(() => {
    const updatePrices = async () => {
      const updates: Record<string, number> = { ...prices };

      for (const symbol of Object.keys(TOKEN_PRICES)) {
        const impact = await updatePriceFromRecentClaims(symbol);
        const currentPrice = TOKEN_PRICES[symbol] || 0;
        updates[symbol] = currentPrice * (1 + impact);
      }

      setPrices(updates);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000);

    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          await updatePrices();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  return prices;
};