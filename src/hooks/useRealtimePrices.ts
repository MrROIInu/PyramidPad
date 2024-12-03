import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TOKEN_PRICES } from '../lib/tokenPrices';
import { fetchRXDPrice } from '../lib/priceManager';

export const useRealtimePrices = () => {
  const [prices, setPrices] = useState(TOKEN_PRICES);

  useEffect(() => {
    // Initial price fetch
    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from('tokens')
        .select('symbol,price_usd')
        .order('last_updated', { ascending: false });

      if (!error && data) {
        const newPrices = { ...TOKEN_PRICES };
        data.forEach(token => {
          newPrices[token.symbol] = token.price_usd;
        });
        setPrices(newPrices);
      }

      // Update RXD price
      const rxdPrice = await fetchRXDPrice();
      setPrices(prev => ({ ...prev, RXD: rxdPrice }));
    };

    fetchPrices();

    // Subscribe to price updates
    const subscription = supabase
      .channel('token-prices')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tokens' },
        async (payload) => {
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
      subscription.unsubscribe();
    };
  }, []);

  return prices;
};