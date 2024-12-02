import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';

export const usePriceEffect = () => {
  useEffect(() => {
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new.claimed) {
            const { from_token, to_token, from_amount, to_amount } = payload.new;
            
            // Calculate price impact (0.1% per order)
            const IMPACT_FACTOR = 0.001;
            
            if (from_token !== 'RXD') {
              const currentPrice = TOKEN_PRICES[from_token];
              const newPrice = currentPrice * (1 - IMPACT_FACTOR);
              TOKEN_PRICES[from_token] = newPrice;
            }
            
            if (to_token !== 'RXD') {
              const currentPrice = TOKEN_PRICES[to_token];
              const newPrice = currentPrice * (1 + IMPACT_FACTOR);
              TOKEN_PRICES[to_token] = newPrice;
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};