import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES, getTokenPrice } from '../lib/prices/tokenPrices';
import { TOKENS } from '../data/tokens';
import { startPriceUpdates, stopPriceUpdates, initializePrices } from '../lib/prices/priceManager';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);

  useEffect(() => {
    const initialize = async () => {
      await initializePrices();
      setPrices({ ...TOKEN_PRICES });
    };

    initialize();
    startPriceUpdates();

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        (payload) => {
          if (payload.new?.symbol && payload.new?.price_usd) {
            setPrices(prev => ({
              ...prev,
              [payload.new.symbol]: payload.new.price_usd
            }));
          }
        }
      )
      .subscribe();

    return () => {
      stopPriceUpdates();
      subscription.unsubscribe();
    };
  }, []);

  return new Proxy(prices, {
    get(target, prop) {
      if (typeof prop === 'string') {
        return getTokenPrice(prop);
      }
      return target[prop as any];
    }
  });
};