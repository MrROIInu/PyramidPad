import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES, updateRXDPrice } from '../lib/tokenPrices';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);

  useEffect(() => {
    // Initial price update
    updateRXDPrice().then(newPrices => setPrices({ ...newPrices }));

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        () => {
          updateRXDPrice().then(newPrices => setPrices({ ...newPrices }));
        }
      )
      .subscribe();

    // Update prices every minute
    const interval = setInterval(() => {
      updateRXDPrice().then(newPrices => setPrices({ ...newPrices }));
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return prices;
};