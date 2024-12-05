import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import { TOKENS } from '../data/tokens';

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
    // Initialize price history
    const fetchInitialPrices = async () => {
      const { data, error } = await supabase
        .from('token_price_history')
        .select('*')
        .order('timestamp', { ascending: true });

      if (!error && data) {
        const history: PriceHistory = {};
        const changes: PriceChanges = {};

        TOKENS.forEach(token => {
          const tokenPrices = data
            .filter(p => p.symbol === token.symbol)
            .map(p => p.price_usd);

          history[token.symbol] = tokenPrices;

          // Calculate price change
          if (tokenPrices.length >= 2) {
            const oldPrice = tokenPrices[0];
            const newPrice = tokenPrices[tokenPrices.length - 1];
            changes[token.symbol] = ((newPrice - oldPrice) / oldPrice) * 100;
          } else {
            changes[token.symbol] = 0;
          }
        });

        setPriceHistory(history);
        setPriceChanges(changes);
      }
    };

    fetchInitialPrices();

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        (payload) => {
          if (payload.new?.symbol && payload.new?.price_usd) {
            const symbol = payload.new.symbol;
            const newPrice = payload.new.price_usd;

            setPriceHistory(prev => {
              const prices = [...(prev[symbol] || []), newPrice];
              return {
                ...prev,
                [symbol]: prices.slice(-168) // Keep last 7 days worth of data points
              };
            });

            setPriceChanges(prev => {
              const prices = priceHistory[symbol] || [];
              if (prices.length > 0) {
                const oldPrice = prices[0];
                const change = ((newPrice - oldPrice) / oldPrice) * 100;
                return { ...prev, [symbol]: change };
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { priceHistory, priceChanges };
};